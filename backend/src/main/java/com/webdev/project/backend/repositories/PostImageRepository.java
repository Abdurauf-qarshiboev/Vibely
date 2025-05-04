package com.webdev.project.backend.repositories;

import com.webdev.project.backend.entities.Post;
import com.webdev.project.backend.entities.PostImage;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostImageRepository extends JpaRepository<PostImage, Long> {

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO post_image (post_id, image_url) VALUES (?1, ?2)", nativeQuery = true)
    void saveImage(Long postId, String imagePath);

    List<PostImage> getPostImagesByPostId(Long postId);

}
