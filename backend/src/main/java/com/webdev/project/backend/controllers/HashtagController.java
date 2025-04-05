package com.webdev.project.backend.controllers;

import com.webdev.project.backend.entities.Hashtag;
import com.webdev.project.backend.services.HashtagService;
import com.webdev.project.backend.utils.ResponseUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/hashtags")
public class HashtagController {

    private final HashtagService hashtagService;

    @Autowired
    public HashtagController(HashtagService hashtagService) {
        this.hashtagService = hashtagService;
    }

    @GetMapping("/trending")
    public ResponseEntity<?> getTrendingHashtags(@RequestParam(defaultValue = "10") int limit) {
        List<Hashtag> trendingHashtags = hashtagService.getTrendingHashtags(limit);
        ResponseEntity<List<Hashtag>> originalResponse = ResponseEntity.ok(trendingHashtags);
        return ResponseUtil.success(originalResponse, "Trending hashtags retrieved");
    }

    @GetMapping("/{name}/posts")
    public ResponseEntity<?> getPostsByHashtag(
            @PathVariable String name,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        Optional<Hashtag> hashtag = hashtagService.getHashtagByName(name);

        if (hashtag.isPresent()) {
            // Fetch posts associated with the hashtag logic (to be implemented)
            // For now, we're simulating the response using the hashtag details
            ResponseEntity<Hashtag> originalResponse = ResponseEntity.ok(hashtag.get());
            return ResponseUtil.success(originalResponse, "Posts for hashtag retrieved");
        } else {
            return ResponseUtil.error("NOT_FOUND", "Hashtag not found", HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping
    public ResponseEntity<?> createHashtag(@RequestBody Hashtag hashtag) {
        Hashtag createdHashtag = hashtagService.createHashtag(hashtag);
        ResponseEntity<Hashtag> originalResponse = ResponseEntity.status(HttpStatus.CREATED).body(createdHashtag);
        return ResponseUtil.success(originalResponse, "Hashtag created successfully");
    }

    @GetMapping("/{name}")
    public ResponseEntity<?> getHashtagDetails(@PathVariable String name) {
        Optional<Hashtag> hashtag = hashtagService.getHashtagByName(name);

        if (hashtag.isPresent()) {
            ResponseEntity<Hashtag> originalResponse = ResponseEntity.ok(hashtag.get());
            return ResponseUtil.success(originalResponse, "Hashtag details retrieved successfully");
        } else {
            return ResponseUtil.error("NOT_FOUND", "Hashtag not found", HttpStatus.NOT_FOUND);
        }
    }
}
