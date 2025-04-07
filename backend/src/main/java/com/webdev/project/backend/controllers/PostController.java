package com.webdev.project.backend.controllers;

import com.webdev.project.backend.entities.Post;
import com.webdev.project.backend.services.PostService;
import com.webdev.project.backend.utils.ResponseUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;
@RestController
@RequestMapping("/api/v1/posts")
public class PostController {

    private final PostService postService;

    @Autowired
    public PostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping
    public ResponseEntity<?> createPost(
            @RequestParam(required = false) String title,
            @RequestParam String body,
            @RequestParam(required = false) MultipartFile image,
            @RequestParam(required = false) String hashtags,
            @RequestParam(defaultValue = "false") Boolean isPrivate) {
        Post post = new Post();
        post.setTitle(title);
        post.setBody(body);
        post.setImage(image != null ? image.getOriginalFilename() : null);
        post.setIsPrivate(isPrivate);

        Post createdPost = postService.createPost(post);

        ResponseEntity<Post> originalResponse = ResponseEntity.status(HttpStatus.CREATED).body(createdPost);
        return ResponseUtil.success(originalResponse, "Post created successfully");
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPost(@PathVariable Long id) {
        Optional<Post> post = postService.getPostById(id);

        if (post.isPresent()) {
            ResponseEntity<Post> originalResponse = ResponseEntity.ok(post.get());
            return ResponseUtil.success(originalResponse, "Post retrieved successfully");
        } else {
            return ResponseUtil.error("NOT_FOUND", "Post not found", HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(@PathVariable Long id, @RequestBody Post updatedPost) {
        Optional<Post> post = postService.getPostById(id);

        if (post.isPresent()) {
            Post existingPost = post.get();
            existingPost.setTitle(updatedPost.getTitle());
            existingPost.setBody(updatedPost.getBody());
            existingPost.setIsPrivate(updatedPost.getIsPrivate());

            Post updatedEntity = postService.createPost(existingPost);

            ResponseEntity<Post> originalResponse = ResponseEntity.ok(updatedEntity);
            return ResponseUtil.success(originalResponse, "Post updated successfully");
        } else {
            return ResponseUtil.error("NOT_FOUND", "Post not found", HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        postService.deletePost(id);

        ResponseEntity<Void> originalResponse = ResponseEntity.ok().build();
        return ResponseUtil.success(originalResponse, "Post deleted successfully");
    }
}
