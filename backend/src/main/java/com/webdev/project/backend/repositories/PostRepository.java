package com.webdev.project.backend.repositories;

import com.webdev.project.backend.entities.Post;
import com.webdev.project.backend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    // Get all posts by a specific user
    List<Post> findByUserAndIsPrivateFalse(User user);


    @Query("SELECT p FROM Post p WHERE p.isPrivate = false AND " +
            "(LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(p.body) LIKE LOWER(CONCAT('%', :query, '%')))")

    List<Post> searchPublicPosts(@Param("query") String query);

    List<Post> findByUserIsNotAndIsPrivateFalse(User user);

    List<Post> findByUser(User currentUser);
}
