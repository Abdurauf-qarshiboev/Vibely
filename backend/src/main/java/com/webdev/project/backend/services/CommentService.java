package com.webdev.project.backend.services;

import com.webdev.project.backend.entities.Comment;
import com.webdev.project.backend.entities.Post;
import com.webdev.project.backend.entities.User;
import com.webdev.project.backend.enums.NotificationType;
import com.webdev.project.backend.exceptions.ResourceNotFoundException;
import com.webdev.project.backend.rabbitmq.NotificationProducer;
import com.webdev.project.backend.repositories.CommentRepository;
import com.webdev.project.backend.repositories.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private NotificationProducer notificationProducer;

    @Transactional
    public Comment addComment(User user, Post post, String body, Long parentCommentId) {
        Comment comment = new Comment();
        comment.setUser(user);
        comment.setPost(post);
        comment.setBody(body);

        // Handle parent comment if provided
        if (parentCommentId != null) {
            Optional<Comment> parentCommentOptional = commentRepository.findById(parentCommentId);
            if (parentCommentOptional.isEmpty()) {
                throw new ResourceNotFoundException("Parent comment not found");
            }
            Comment parentComment = parentCommentOptional.get();
            comment.setParentComment(parentComment);

            // Increment comment count on parent comment
            parentComment.setCommentCount(parentComment.getCommentCount() + 1);
            commentRepository.save(parentComment);
        }

        // Increment comment count on post
        post.setCommentCount(post.getCommentCount() + 1);
        postRepository.save(post);

        // Send notification (async)
        if (!user.getId().equals(post.getUser().getId())) { // Skip if commenting/replying to his own post/comment
            if (parentCommentId != null) {

                Optional<Comment> parentCommentOptional = commentRepository.findById(parentCommentId);
                if (parentCommentOptional.isPresent()) {
                    Comment parentComment = parentCommentOptional.get();
                    notificationProducer.sendCommentNotification(parentComment.getUser(), user, null, parentComment, NotificationType.COMMENT_REPLY); // Reply to a comment
                }
            }
            else {
                notificationProducer.sendCommentNotification(post.getUser(), user, post, null, NotificationType.COMMENT_POST); // Comment to a post
            }
        }


        return commentRepository.save(comment);
    }

    /**
     * Get comments for a post
     * If parentCommentId is null, return top-level comments
     * Otherwise, return replies to the specified comment
     */
    public List<Comment> getPostComments(Post post, Long parentCommentId) {
        if (parentCommentId == null) {
            // Return top-level comments (no parent)
            return commentRepository.findByPostAndParentCommentIsNullOrderByCreatedAtDesc(post);
        } else {
            // Return replies to a specific comment
            Optional<Comment> parentCommentOptional = commentRepository.findById(parentCommentId);
            if (parentCommentOptional.isEmpty()) {
                throw new ResourceNotFoundException("Parent comment not found");
            }
            return commentRepository.findByParentCommentOrderByCreatedAtDesc(parentCommentOptional.get());
        }
    }

    /**
     * Get replies to a specific comment
     */
    public List<Comment> getCommentReplies(Comment parentComment) {
        return commentRepository.findByParentCommentOrderByCreatedAtDesc(parentComment);
    }

    /**
     * Update a comment
     */
    @Transactional
    public Comment updateComment(Long commentId, User currentUser, String newBody) {
        Optional<Comment> commentOptional = commentRepository.findById(commentId);
        if (commentOptional.isEmpty()) {
            throw new ResourceNotFoundException("Comment not found");
        }

        Comment comment = commentOptional.get();

        // Check if the user is the owner of the comment
        if (!comment.getUser().getId().equals(currentUser.getId())) {
            throw new SecurityException("You can only update your own comments");
        }

        comment.setBody(newBody);
        return commentRepository.save(comment);
    }

    /**
     * Delete a comment
     */
    @Transactional
    public void deleteComment(Long commentId, User currentUser) {
        Optional<Comment> commentOptional = commentRepository.findById(commentId);
        if (commentOptional.isEmpty()) {
            throw new ResourceNotFoundException("Comment not found");
        }

        Comment comment = commentOptional.get();

        // Check if the user is the owner of the comment
        if (!comment.getUser().getId().equals(currentUser.getId())) {
            throw new SecurityException("You can only delete your own comments");
        }

        // Get all replies recursively (direct and indirect)
        List<Comment> allReplies = getAllRepliesRecursively(comment);

        // Decrement comment count on post for all deleted comments (parent + replies)
        Post post = comment.getPost();
        int totalCommentsToDelete = 1 + allReplies.size(); // Parent comment + all replies
        post.setCommentCount(post.getCommentCount() - totalCommentsToDelete);
        postRepository.save(post);

        // Decrement comment count on parent comment if it exists
        if (comment.getParentComment() != null) {
            Comment parentComment = comment.getParentComment();
            parentComment.setCommentCount(parentComment.getCommentCount() - 1);
            commentRepository.save(parentComment);
        }

        // Delete all replies first to avoid constraint violations
        commentRepository.deleteAll(allReplies);

        // Finally delete the parent comment
        commentRepository.delete(comment);
    }

    private List<Comment> getAllRepliesRecursively(Comment parentComment) {

        // Get direct replies
        List<Comment> directReplies = commentRepository.findByParentComment(parentComment);

        // Add direct replies to the list
        List<Comment> allReplies = new ArrayList<>(directReplies);

        // Recursively get replies to each direct reply
        for (Comment reply : directReplies) {
            allReplies.addAll(getAllRepliesRecursively(reply));
        }

        return allReplies;
    }
}