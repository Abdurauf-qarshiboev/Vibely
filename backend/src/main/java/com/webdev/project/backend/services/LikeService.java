package com.webdev.project.backend.services;

import com.webdev.project.backend.entities.Like;
import com.webdev.project.backend.repositories.CommentRepository;
import com.webdev.project.backend.repositories.LikeRepository;
import com.webdev.project.backend.repositories.PostRepository;
import com.webdev.project.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LikeService {

    private final LikeRepository likeRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;

    @Autowired
    public LikeService(LikeRepository likeRepository,UserRepository userRepository,CommentRepository commentRepository,PostRepository postRepository) {
        this.likeRepository = likeRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
    }

    

}
