package com.webdev.project.backend.repositories;

import com.webdev.project.backend.entities.PostHashtag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostHashtagRepository extends JpaRepository<PostHashtag, Integer> {

    List<PostHashtag> findByPostId(Integer postId);

    List<PostHashtag> findByHashtagId(Integer hashtagId);
}
