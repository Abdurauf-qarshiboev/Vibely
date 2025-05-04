package com.webdev.project.backend.controllers;

import com.webdev.project.backend.dto.HashtagDTO;
import com.webdev.project.backend.dto.PostDTO;
import com.webdev.project.backend.entities.Hashtag;
import com.webdev.project.backend.services.HashtagService;
import com.webdev.project.backend.utils.ResponseUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/hashtags")
public class HashtagController {

    private final HashtagService hashtagService;

    @Autowired
    public HashtagController(HashtagService hashtagService) {
        this.hashtagService = hashtagService;
    }

    @GetMapping("/trending")
    public ResponseEntity<?> getTrendingHashtags(
            @RequestParam(value = "limit", required = false, defaultValue = "10") int limit
    ) {
        try {
            List<HashtagDTO> trendingHashtags = hashtagService.getTrendingHashtags(limit);
            ResponseEntity<List<HashtagDTO>> originalResponse = ResponseEntity.ok(trendingHashtags);
            return ResponseUtil.success(originalResponse, "Trending hashtags retrieved");
        } catch (Exception e) {
            return ResponseUtil.error("HASHTAG_001", "Error retrieving trending hashtags: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/posts")
    public ResponseEntity<?> getPostsByHashtag(@RequestParam("name") String rawName) {
        String name = rawName.trim();

        if (name.isEmpty()) {
            return ResponseUtil.error("HASHTAG_003", "Hashtag name must not be empty", HttpStatus.BAD_REQUEST);
        }

        Optional<Hashtag> optionalHashtag = hashtagService.getHashtagByName(name);
        if (optionalHashtag.isEmpty()) {
            return ResponseUtil.error("HASHTAG_002", "Hashtag not found", HttpStatus.NOT_FOUND);
        }

        Hashtag hashtag = optionalHashtag.get();
        List<PostDTO> postDTOs = hashtagService.getPublicPostsByHashtagName(name)
                .stream().map(PostDTO::new).toList();

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("hashtag", new HashtagDTO(hashtag));
        responseData.put("posts", postDTOs);

        return ResponseUtil.success(ResponseEntity.ok(responseData), "Hashtag posts retrieved");
    }
}
