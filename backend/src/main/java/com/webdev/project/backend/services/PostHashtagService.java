package com.webdev.project.backend.services;

import com.webdev.project.backend.entities.Hashtag;
import com.webdev.project.backend.entities.Post;
import com.webdev.project.backend.entities.PostHashtag;
import com.webdev.project.backend.repositories.PostHashtagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;

@Service
public class PostHashtagService {

    private final PostHashtagRepository postHashtagRepository;

    @Autowired
    public PostHashtagService(PostHashtagRepository postHashtagRepository) {
        this.postHashtagRepository = postHashtagRepository;
    }

    public PostHashtag addHashtagToPost(Post post, Hashtag hashtag) {
        PostHashtag postHashtag = new PostHashtag();
        postHashtag.setPost(post);
        postHashtag.setHashtag(hashtag);
        postHashtag.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        return postHashtagRepository.save(postHashtag);
    }

    public List<PostHashtag> getPostHashtagsByPostId(Integer postId) {
        return postHashtagRepository.findByPostId(postId);
    }

    public List<PostHashtag> getPostHashtagsByHashtagId(Integer hashtagId) {
        return postHashtagRepository.findByHashtagId(hashtagId);
    }

    public void removePostHashtag(Integer id) {
        if (!postHashtagRepository.existsById(id)) {
            throw new RuntimeException("PostHashtag not found");
        }
        postHashtagRepository.deleteById(id);
    }
}
