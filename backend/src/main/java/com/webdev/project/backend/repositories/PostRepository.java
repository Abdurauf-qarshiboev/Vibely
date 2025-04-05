package com.webdev.project.backend.repositories;

import com.webdev.project.backend.entities.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post>findByUserId(Integer userId);
    List<Post>findByIsPrivateFalse();
}
