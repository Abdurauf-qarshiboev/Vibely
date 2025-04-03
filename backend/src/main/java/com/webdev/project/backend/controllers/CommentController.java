package com.webdev.project.backend.controllers;

import com.webdev.project.backend.entities.Comment;
import com.webdev.project.backend.entities.Post;
import com.webdev.project.backend.entities.User;
import com.webdev.project.backend.services.CommentService;
import com.webdev.project.backend.services.PostService;
import com.webdev.project.backend.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/comments")
@Validated
public class CommentController {

    private final CommentService commentService;
    private final PostService postService;
    private final UserService userService;

    @Autowired
    public CommentController(CommentService commentService, PostService postService, UserService userService) {
        this.commentService = commentService;
        this.postService = postService;
        this.userService = userService;
    }

    // Create a new comment on a post
    @PostMapping("/{postId}/{username}")
    public ResponseEntity<Comment> createComment(@PathVariable Long postId, @PathVariable String username,
                                                 @Valid @RequestBody Comment comment) {
        Optional<Post> post = postService.getPostById(postId);
        Optional<User> user = userService.findByUsername(username);

        if (post.isEmpty() || user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        Comment createdComment = commentService.createComment(post.get(), user.get(), comment);
        return new ResponseEntity<>(createdComment, HttpStatus.CREATED);
    }

    // Get all comments for a post
    @GetMapping("/{postId}")
    public ResponseEntity<List<Comment>> getCommentsByPost(@PathVariable Long postId) {
        return ResponseEntity.ok(commentService.getCommentsByPostId(postId));
    }

    // Delete a comment by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
