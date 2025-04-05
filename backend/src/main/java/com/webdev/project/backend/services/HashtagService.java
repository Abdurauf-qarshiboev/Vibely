package com.webdev.project.backend.services;

import com.webdev.project.backend.entities.Hashtag;
import com.webdev.project.backend.repositories.HashtagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class HashtagService {

    private final HashtagRepository hashtagRepository;

    @Autowired
    public HashtagService(HashtagRepository hashtagRepository) {
        this.hashtagRepository = hashtagRepository;
    }

    public Hashtag createHashtag(Hashtag hashtag) {
        return hashtagRepository.save(hashtag);
    }

    public Optional<Hashtag> getHashtagByName(String name) {
        return hashtagRepository.findByName(name);
    }

    public Optional<Hashtag> getHashtagById(Integer id) {
        return hashtagRepository.findById(id);
    }


    public List<Hashtag> getTrendingHashtags(int limit) {
        return hashtagRepository.findAll(PageRequest.of(0, limit)).getContent();
    }
}
