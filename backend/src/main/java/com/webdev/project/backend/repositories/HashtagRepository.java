package com.webdev.project.backend.repositories;

import com.webdev.project.backend.entities.Hashtag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface HashtagRepository extends JpaRepository<Hashtag, Long> {

    // Find by hashtag name (used for /hashtags/:name/posts)
    Optional<Hashtag> findByNameIgnoreCase(String name);

    // Get trending hashtags ordered by post count descending, limited by parameter
    @Query("SELECT h FROM Hashtag h ORDER BY h.postCount DESC")
    List<Hashtag> findTopTrendingHashtags(org.springframework.data.domain.Pageable pageable);

    @Query("SELECT DISTINCT h FROM Hashtag h LEFT JOIN FETCH h.posts WHERE LOWER(h.name) = LOWER(:name)")
    Optional<Hashtag> findByNameWithPosts(@Param("name") String name);

}
