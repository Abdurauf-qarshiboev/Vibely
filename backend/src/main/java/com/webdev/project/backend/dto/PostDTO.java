package com.webdev.project.backend.dto;

import com.webdev.project.backend.entities.Post;
import java.time.LocalDateTime;

public class PostDTO {
    private final Long id;
    private final UserDTO user;
    private final String title;
    private final String body;
    private final Integer likeCount;
    private final Integer commentCount;
    private final String image;
    private final Boolean isPrivate;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public PostDTO(Post post) {
        this.id = post.getId();
        this.user = new UserDTO(post.getUser());
        this.title = post.getTitle();
        this.body = post.getBody();
        this.likeCount = post.getLikeCount();
        this.commentCount = post.getCommentCount();
        this.image = post.getImage();
        this.isPrivate = post.getPrivate();
        this.createdAt = post.getCreatedAt();
        this.updatedAt = post.getUpdatedAt();
    }

    public Long getId() { return id; }
    public UserDTO getUser() { return user; }
    public String getTitle() { return title; }
    public String getBody() { return body; }
    public Integer getLikeCount() { return likeCount; }
    public Integer getCommentCount() { return commentCount; }
    public String getImage() { return image; }
    public Boolean getPrivate() { return isPrivate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
