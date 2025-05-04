package com.webdev.project.backend.dto;

import com.webdev.project.backend.entities.Comment;

import java.sql.Timestamp;

public class CommentDTO {

    private Long id;
    private String body;
    private Integer likeCount;
    private Integer replyCount;
    private UserDTO user;
    private Boolean isLiked;
    private Timestamp created_at;
    private Timestamp updated_at;

    public CommentDTO(Comment comment) {
        this.id = comment.getId();
        this.body = comment.getBody();
        this.likeCount = comment.getLikeCount();
        this.replyCount = comment.getCommentCount();
        this.user = new UserDTO(comment.getUser());
        this.created_at = comment.getCreatedAt();
        this.isLiked = false;
    }

    public Long getId() {
        return id;
    }

    public String getBody() {
        return body;
    }

    public Integer getLikeCount() {
        return likeCount;
    }

    public Integer getReplyCount() {
        return replyCount;
    }

    public Timestamp getCreated_at() {
        return created_at;
    }

    public UserDTO getUser() {
        return user;
    }

    public Timestamp getUpdated_at() {
        return updated_at;
    }

    public Boolean getLiked() {
        return isLiked;
    }

    public void setLiked(Boolean liked) {
        isLiked = liked;
    }
}
