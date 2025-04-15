package com.webdev.project.backend.repositories;

import com.webdev.project.backend.entities.Comment;
import com.webdev.project.backend.entities.Like;
import com.webdev.project.backend.entities.Post;
import com.webdev.project.backend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {

    // Post-related
    boolean existsByUserAndPost(User user, Post post);
    Optional<Like> findByUserAndPost(User user, Post post);
    List<Like> findByPost(Post post);

    // Comment-related
    boolean existsByUserAndComment(User user, Comment comment);
    Optional<Like> findByUserAndComment(User user, Comment comment);
    List<Like> findByComment(Comment comment);
}
