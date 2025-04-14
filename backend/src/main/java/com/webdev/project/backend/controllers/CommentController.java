package com.webdev.project.backend.controllers;

import com.webdev.project.backend.dto.CommentDTO;
import com.webdev.project.backend.entities.Comment;
import com.webdev.project.backend.entities.Post;
import com.webdev.project.backend.entities.User;
import com.webdev.project.backend.exceptions.ResourceNotFoundException;
import com.webdev.project.backend.repositories.CommentRepository;
import com.webdev.project.backend.repositories.PostRepository;
import com.webdev.project.backend.repositories.UserRepository;
import com.webdev.project.backend.requests.CommentUpdateRequest;
import com.webdev.project.backend.requests.CreateCommentRequest;
import com.webdev.project.backend.services.CommentService;
import com.webdev.project.backend.utils.ResponseUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<?> addComment(
            @PathVariable Long postId,
            @RequestBody CreateCommentRequest commentRequest,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {

            Optional<User> currentUserOptional = userRepository.findByUsername(userDetails.getUsername());
            if (currentUserOptional.isEmpty()) {
                return ResponseUtil.error("COMMENT_001", "Not authenticated", HttpStatus.UNAUTHORIZED);
            }

            Optional<Post> postOptional = postRepository.findById(postId);
            if (postOptional.isEmpty()) {
                return ResponseUtil.error("COMMENT_002", "Post not found", HttpStatus.NOT_FOUND);
            }

            String body = commentRequest.getBody();
            if (body == null || body.trim().isEmpty()) {
                return ResponseUtil.error("COMMENT_003", "Comment body cannot be empty", HttpStatus.BAD_REQUEST);
            }

            Long parentCommentId = null;
            if (commentRequest.getParent_comment_id() != null) {
                parentCommentId = commentRequest.getParent_comment_id();
            }

            Comment comment = commentService.addComment(currentUserOptional.get(), postOptional.get(), body, parentCommentId);
            ResponseEntity<CommentDTO> responseEntity = new ResponseEntity<>(new CommentDTO(comment), HttpStatus.CREATED);

            return ResponseUtil.success(responseEntity, "Comment added successfully");
        } catch (ResourceNotFoundException e) {
            return ResponseUtil.error("COMMENT_004", e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return ResponseUtil.error("COMMENT_005", "Failed to add comment:    " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<?> getPostComments(
            @PathVariable Long postId,
            @AuthenticationPrincipal UserDetails userDetails) {

        User currentUser = null;
        if (userDetails != null) {
            Optional<User> currentUserOptional = userRepository.findByUsername(userDetails.getUsername());
            if (currentUserOptional.isPresent()) {
                currentUser = currentUserOptional.get();
            }
        }

        Optional<Post> postOptional = postRepository.findById(postId);
        if (postOptional.isEmpty()) {
            return ResponseUtil.error("COMMENT_006", "Post not found", HttpStatus.NOT_FOUND);
        }

        // Check if post is private and user is not authenticated
        Post post = postOptional.get();
        if (post.getPrivate() && currentUser == null) {
            return ResponseUtil.error("COMMENT_007", "Not authorized to view comments on private post", HttpStatus.UNAUTHORIZED);
        }

        try {
            List<Comment> comments = commentService.getPostComments(post, null);
            List<CommentDTO> commentDTOs = comments.stream()
                    .map(comment -> {
                        CommentDTO dto = new CommentDTO(comment);
                        // Here you would set liked_by_you if you had that functionality
                        return dto;
                    })
                    .collect(Collectors.toList());

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("comments", commentDTOs);

            ResponseEntity<Map<String, Object>> responseEntity = new ResponseEntity<>(responseData, HttpStatus.OK);

            return ResponseUtil.success(responseEntity, "Comments retrieved");
        } catch (Exception e) {
            return ResponseUtil.error("COMMENT_008", "Failed to retrieve comments", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/comments/{commentId}/replies")
    public ResponseEntity<?> getCommentReplies(
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserDetails userDetails) {

        User currentUser = null;
        if (userDetails != null) {
            Optional<User> currentUserOptional = userRepository.findByUsername(userDetails.getUsername());
            if (currentUserOptional.isPresent()) {
                currentUser = currentUserOptional.get();
            }
        }

        Optional<Comment> commentOptional = commentRepository.findById(commentId);
        if (commentOptional.isEmpty()) {
            return ResponseUtil.error("COMMENT_009", "Comment not found", HttpStatus.NOT_FOUND);
        }

        Comment parentComment = commentOptional.get();
        Post post = parentComment.getPost();

        // Check if post is private and user is not authenticated
        if (post.getPrivate() && currentUser == null) {
            return ResponseUtil.error("COMMENT_010", "Not authorized to view replies on private post", HttpStatus.UNAUTHORIZED);
        }

        try {
            List<Comment> replies = commentService.getCommentReplies(parentComment);
            List<CommentDTO> replyDTOs = replies.stream()
                    .map(reply -> {
                        CommentDTO dto = new CommentDTO(reply);
                        // Here you would set liked_by_you if you had that functionality
                        return dto;
                    })
                    .collect(Collectors.toList());

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("replies", replyDTOs);

            ResponseEntity<Map<String, Object>> responseEntity = new ResponseEntity<>(responseData, HttpStatus.OK);

            return ResponseUtil.success(responseEntity, "Replies retrieved");
        } catch (Exception e) {
            return ResponseUtil.error("COMMENT_011", "Failed to retrieve replies", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/comments/{id}")
    public ResponseEntity<?> updateComment(
            @PathVariable Long id,
            @RequestBody CommentUpdateRequest commentUpdateRequest,
            @AuthenticationPrincipal UserDetails userDetails) {

        Optional<User> currentUserOptional = userRepository.findByUsername(userDetails.getUsername());
        if (currentUserOptional.isEmpty()) {
            return ResponseUtil.error("COMMENT_012", "Not authenticated", HttpStatus.UNAUTHORIZED);
        }

        String body = commentUpdateRequest.getBody();
        if (body == null || body.trim().isEmpty()) {
            return ResponseUtil.error("COMMENT_013", "Comment body cannot be empty", HttpStatus.BAD_REQUEST);
        }

        try {
            Comment updatedComment = commentService.updateComment(id, currentUserOptional.get(), body);

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("id", updatedComment.getId());
            responseData.put("body", updatedComment.getBody());
            responseData.put("updated_at", updatedComment.getUpdatedAt());

            ResponseEntity<Map<String, Object>> responseEntity = new ResponseEntity<>(responseData, HttpStatus.OK);

            return ResponseUtil.success(responseEntity, "Comment updated successfully");
        } catch (ResourceNotFoundException e) {
            return ResponseUtil.error("COMMENT_014", e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (SecurityException e) {
            return ResponseUtil.error("COMMENT_015", e.getMessage(), HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            return ResponseUtil.error("COMMENT_016", "Failed to update comment", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        Optional<User> currentUserOptional = userRepository.findByUsername(userDetails.getUsername());
        if (currentUserOptional.isEmpty()) {
            return ResponseUtil.error("COMMENT_017", "Not authenticated", HttpStatus.UNAUTHORIZED);
        }

        try {
            commentService.deleteComment(id, currentUserOptional.get());
            ResponseEntity<Map<String, Object>> responseEntity = new ResponseEntity<>(HttpStatus.OK);
            return ResponseUtil.success(responseEntity, "Comment deleted successfully");
        } catch (ResourceNotFoundException e) {
            return ResponseUtil.error("COMMENT_018", e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (SecurityException e) {
            return ResponseUtil.error("COMMENT_019", e.getMessage(), HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            return ResponseUtil.error("COMMENT_020", "Failed to delete comment: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/comments/{id}/like")
    public ResponseEntity<?> likeComment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        Optional<User> currentUserOptional = userRepository.findByUsername(userDetails.getUsername());
        if (currentUserOptional.isEmpty()) {
            return ResponseUtil.error("COMMENT_021", "Not authenticated", HttpStatus.UNAUTHORIZED);
        }

        // TODO: Finish after like is implemented
        return ResponseUtil.error("COMMENT_022", "Like functionality not implemented yet", HttpStatus.NOT_IMPLEMENTED);
    }

    @DeleteMapping("/comments/{id}/unlike")
    public ResponseEntity<?> unlikeComment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        Optional<User> currentUserOptional = userRepository.findByUsername(userDetails.getUsername());
        if (currentUserOptional.isEmpty()) {
            return ResponseUtil.error("COMMENT_023", "Not authenticated", HttpStatus.UNAUTHORIZED);
        }

        // TODO: Finish after like is implemented
        return ResponseUtil.error("COMMENT_024", "Unlike functionality not implemented yet", HttpStatus.NOT_IMPLEMENTED);
    }
}