package com.webdev.project.backend.services;

import com.webdev.project.backend.entities.Post;
import com.webdev.project.backend.entities.PostImage;
import com.webdev.project.backend.repositories.PostImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PostImageService {

    private final PostImageRepository postImageRepository;

    @Autowired
    public PostImageService(PostImageRepository postImageRepository) {
        this.postImageRepository = postImageRepository;
    }


    public void setImagesForPost(Post post, List<String> imagePaths) {

        for (String imagePath : imagePaths) {
            postImageRepository.saveImage(post.getId(), imagePath);
        }

    }

    public List<PostImage> getImagesForPost(Post post) {

        return postImageRepository.getPostImagesByPostId(post.getId());

    }
}
