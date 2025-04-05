package com.webdev.project.backend.controllers;

import com.webdev.project.backend.entities.Hashtag;
import com.webdev.project.backend.entities.Post;
import com.webdev.project.backend.entities.PostHashtag;
import com.webdev.project.backend.services.HashtagService;
import com.webdev.project.backend.services.PostHashtagService;
import com.webdev.project.backend.services.PostService;
import com.webdev.project.backend.utils.ResponseUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/postHashtags")
public class PostHashtagController {

    private final PostService postService;
    private final HashtagService hashtagService;
    private final PostHashtagService postHashtagService;

    @Autowired
    public PostHashtagController(
            PostService postService,
            HashtagService hashtagService,
            PostHashtagService postHashtagService) {
        this.postService = postService;
        this.hashtagService = hashtagService;
        this.postHashtagService = postHashtagService;
    }

    @PostMapping
    public ResponseEntity<?> addHashtagToPost(
            @RequestParam Long postId,
            @RequestParam Integer hashtagId) {
        // Fetch Post and Hashtag objects using their repositories
        Post post = postService.getPostById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        Hashtag hashtag = hashtagService.getHashtagById(hashtagId)
                .orElseThrow(() -> new RuntimeException("Hashtag not found"));

        // Pass the fetched entities to the service method
        PostHashtag postHashtag = postHashtagService.addHashtagToPost(post, hashtag);

        // Return response
        ResponseEntity<PostHashtag> originalResponse = ResponseEntity.status(HttpStatus.CREATED).body(postHashtag);
        return ResponseUtil.success(originalResponse, "Hashtag added to post successfully");
    }


    @GetMapping("/post/{postId}")
    public ResponseEntity<?> getHashtagsByPost(@PathVariable Integer postId) {
        List<PostHashtag> postHashtags = postHashtagService.getPostHashtagsByPostId(postId);
        ResponseEntity<List<PostHashtag>> originalResponse = ResponseEntity.ok(postHashtags);
        return ResponseUtil.success(originalResponse, "Hashtags associated with post retrieved successfully");
    }

    @GetMapping("/hashtag/{hashtagId}")
    public ResponseEntity<?> getPostsByHashtag(@PathVariable Integer hashtagId) {
        List<PostHashtag> postHashtags = postHashtagService.getPostHashtagsByHashtagId(hashtagId);
        ResponseEntity<List<PostHashtag>> originalResponse = ResponseEntity.ok(postHashtags);
        return ResponseUtil.success(originalResponse, "Posts associated with hashtag retrieved successfully");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeHashtagFromPost(@PathVariable Integer id) {
        postHashtagService.removePostHashtag(id);
        ResponseEntity<Void> originalResponse = ResponseEntity.ok().build();
        return ResponseUtil.success(originalResponse, "Hashtag removed from post successfully");
    }
}
