package com.webdev.project.backend.services;

import com.webdev.project.backend.dto.HashtagDTO;
import com.webdev.project.backend.entities.Hashtag;
import com.webdev.project.backend.entities.Post;
import com.webdev.project.backend.repositories.HashtagRepository;
import com.webdev.project.backend.repositories.PostRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class HashtagService {

    private final HashtagRepository hashtagRepository;
    private final PostRepository postRepository;
    private final ElasticsearchIndexService elasticsearchIndexService;

    public HashtagService(HashtagRepository hashtagRepository, PostRepository postRepository, ElasticsearchIndexService elasticsearchIndexService) {
        this.hashtagRepository = hashtagRepository;
        this.postRepository = postRepository;
        this.elasticsearchIndexService = elasticsearchIndexService;
    }

    // Get trending hashtags (limit is optional)
    public List<HashtagDTO> getTrendingHashtags(int limit) {
        return hashtagRepository.findTopTrendingHashtags(PageRequest.of(0, limit))
                .stream()
                .map(HashtagDTO::new)
                .collect(Collectors.toList());
    }

    // Used in /api/hashtags/posts endpoint
    public Optional<Hashtag> getHashtagByName(String name) {
        return hashtagRepository.findByNameIgnoreCase(name.trim());
    }

    // Used in /api/hashtags/posts endpoint
    public List<Post> getPublicPostsByHashtagName(String name) {
        return postRepository.findPublicPostsByHashtagName(name.trim());
    }

    // Used when creating a post
    public Set<Hashtag> extractOrCreateHashtags(List<String> names) {
        Set<Hashtag> hashtags = new HashSet<>();
        for (String name : names) {
            String trimmedName = name.trim();

            Hashtag hashtag;

            Optional<Hashtag> hashtagOptional = hashtagRepository.findByNameIgnoreCase(trimmedName);

            if (hashtagOptional.isPresent()) {
                hashtag = hashtagOptional.get();
            } else {
                hashtag = hashtagRepository.save(new Hashtag(trimmedName));

                // Index new hashtag in Elasticsearch
                elasticsearchIndexService.indexHashtag(hashtag);
            }

            hashtag.setPostCount(hashtag.getPostCount() + 1);
            hashtagRepository.save(hashtag);

            hashtags.add(hashtag);
        }
        return hashtags;
    }

    // If needed elsewhere (with posts eager-loaded)
    public Optional<Hashtag> getHashtagWithPosts(String name) {
        return hashtagRepository.findByNameWithPosts(name.trim());
    }

    public Optional<Hashtag> findById(Long id) {
        return hashtagRepository.findById(id);
    }
}
