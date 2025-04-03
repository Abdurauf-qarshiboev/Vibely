package com.webdev.project.backend.controllers;

import com.webdev.project.backend.entities.Post;
import com.webdev.project.backend.entities.User;
import com.webdev.project.backend.requests.PostUpdateRequest;
import com.webdev.project.backend.services.PostService;
import com.webdev.project.backend.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/posts")
@Validated
public class PostController {

    private final PostService postService;
    private final UserService userService;

    @Autowired
    public PostController(PostService postService, UserService userService) {
        this.postService = postService;
        this.userService = userService;
    }

    // Handles creating post
    @PostMapping
    public ResponseEntity<Post> createPost(@AuthenticationPrincipal UserDetails userDetails, @Valid @RequestBody Post post) {
        Optional<User> user = userService.findByUsername(userDetails.getUsername());
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        Post createdPost = postService.createPost(user.get(), post);
        return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
    }

    // Gets all the posts
    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }

    // Get only my posts
    @GetMapping("/me")
    public ResponseEntity<List<Post>> getMyPosts(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(postService.getPostsByUserId(userDetails.getUsername()));
    }

    // Get Post by ID
    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable Long id) {
        Optional<Post> post = postService.getPostById(id);
        return post.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // Update Post by ID
    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePostById(@PathVariable Long id, @Valid @RequestBody PostUpdateRequest postUpdateRequest) {

        Optional<Post> optionalPost = postService.getPostById(id);

        if (optionalPost.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        Post post = optionalPost.get();

        if (postUpdateRequest.getTitle() != null) {post.setTitle(postUpdateRequest.getTitle());}
        if (postUpdateRequest.getContent() != null) {post.setContent(postUpdateRequest.getContent());}

        Optional<Post> updatedPostOptional = Optional.ofNullable(postService.updatePost(post));

        return updatedPostOptional.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // Delete Post by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        postService.deletePost(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
