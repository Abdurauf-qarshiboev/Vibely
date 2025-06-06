package com.webdev.project.backend.services;

import com.webdev.project.backend.entities.Comment;
import com.webdev.project.backend.entities.Like;
import com.webdev.project.backend.entities.Post;
import com.webdev.project.backend.entities.User;
import com.webdev.project.backend.enums.NotificationType;
import com.webdev.project.backend.exceptions.ResourceNotFoundException;
import com.webdev.project.backend.rabbitmq.NotificationProducer;
import com.webdev.project.backend.repositories.CommentRepository;
import com.webdev.project.backend.repositories.LikeRepository;
import com.webdev.project.backend.repositories.PostRepository;
import com.webdev.project.backend.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LikeService {

    private final PostRepository postRepository;
    private final LikeRepository likeRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final NotificationProducer notificationProducer;

    public LikeService(PostRepository postRepository,
                       LikeRepository postLikeRepository,
                       UserRepository userRepository, CommentRepository commentRepository, NotificationProducer notificationProducer) {
        this.postRepository = postRepository;
        this.likeRepository = postLikeRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
        this.notificationProducer = notificationProducer;
    }

    @Transactional
    public int likePost(User user, Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        boolean alreadyLiked = likeRepository.existsByUserAndPost(user, post);
        if (alreadyLiked) {
            throw new IllegalStateException("You already liked this post");
        }

        Like like = new Like();
        like.setUser(user);
        like.setPost(post);
        likeRepository.save(like);

        post.setLikeCount(post.getLikeCount() + 1);
        postRepository.save(post);

        // Send notification (async)
        if (!user.getId().equals(post.getUser().getId())) { // Skip liking own post
            notificationProducer.sendLikeNotification(post.getUser(), user, post, null, NotificationType.LIKE_POST);
        }

        return post.getLikeCount();
    }


    @Transactional
    public int unlikePost(Long postId, User user) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        Like like = likeRepository.findByUserAndPost(user, post)
                .orElseThrow(() -> new IllegalArgumentException ("Post not liked yet"));

        likeRepository.delete(like);

        post.setLikeCount(post.getLikeCount() - 1);
        postRepository.save(post);

        return post.getLikeCount();
    }

    public List<Like> getPostLikes(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        return likeRepository.findByPost(post);
    }

    @Transactional
    public int likeComment(Long commentId, User user) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (likeRepository.existsByUserAndComment(user, comment)) {
            throw new IllegalArgumentException("Comment already liked");
        }

        Like like = new Like();
        like.setUser(user);
        like.setComment(comment);
        likeRepository.save(like);

        comment.setLikeCount(comment.getLikeCount() + 1);
        commentRepository.save(comment);

        // Send notification (async)
        if (!user.getId().equals(comment.getUser().getId())) { // Skip liking own comment
            notificationProducer.sendLikeNotification(comment.getUser(), user, comment.getPost(), comment, NotificationType.LIKE_COMMENT);
        }


        return comment.getLikeCount();
    }

    @Transactional
    public int unlikeComment(Long commentId, User user) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        Like like = likeRepository.findByUserAndComment(user, comment)
                .orElseThrow(() -> new IllegalArgumentException("Comment not liked yet"));

        likeRepository.delete(like);

        comment.setLikeCount(comment.getLikeCount() - 1);
        commentRepository.save(comment);

        return comment.getLikeCount();
    }

    public List<Like> getCommentLikes(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        return likeRepository.findByComment(comment);
    }

    public boolean isPostLikedByUser(Long postId, User user) {
        try {
            // First check if the post exists
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

            // Check if the user has liked this post
            return likeRepository.existsByPostIdAndUserId(postId, user.getId());
        } catch (Exception e) {
            return false;
        }
    }

    // Return CommentDTO with is_liked field
    public boolean isCommentLikedByUser(Long commentId, User user) {
        try {
            Comment comment = commentRepository.findById(commentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

            return likeRepository.existsByCommentIdAndUserId(commentId, user.getId());
        } catch (Exception e) {
            return false;
        }
    }
}

