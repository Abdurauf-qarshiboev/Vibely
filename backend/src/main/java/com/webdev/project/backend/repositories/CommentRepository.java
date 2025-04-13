package com.webdev.project.backend.repositories;

import com.webdev.project.backend.entities.Comment;
import com.webdev.project.backend.entities.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByPostAndParentCommentIsNullOrderByCreatedAtDesc(Post post);

    List<Comment> findByParentCommentOrderByCreatedAtDesc(Comment parentComment);

    List<Comment> findByPostOrderByCreatedAtDesc(Post post);

    List<Comment> findByParentComment(Comment parentComment);
}