package com.webdev.project.backend.dto;

import com.webdev.project.backend.entities.Hashtag;
import com.webdev.project.backend.entities.Post;
import com.webdev.project.backend.entities.PostImage;

import java.time.LocalDateTime;
import java.util.List;

public class PostDTO {
    private final Long id;
    private final UserDTO user;
    private final String title;
    private final String body;
    private final Integer likeCount;
    private final Integer commentCount;
    private final List<String> images;
    private final Boolean isPrivate;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
    private final List<String> hashtags;
    private Boolean isLiked;

    public PostDTO(Post post) {
        this.id = post.getId();
        this.user = new UserDTO(post.getUser());
        this.title = post.getTitle();
        this.body = post.getBody();
        this.likeCount = post.getLikeCount();
        this.commentCount = post.getCommentCount();
        this.isPrivate = post.getPrivate();
        this.createdAt = post.getCreatedAt();
        this.updatedAt = post.getUpdatedAt();
        this.hashtags = post.getHashtags()
                .stream()
                .map(Hashtag::getName)
                .toList();
        this.isLiked = false;
        this.images = post.getImages()
                .stream()
                .map(PostImage::getImageUrl)
                .toList();
    }

    public Long getId() { return id; }
    public UserDTO getUser() { return user; }
    public String getTitle() { return title; }
    public String getBody() { return body; }
    public Integer getLikeCount() { return likeCount; }
    public Integer getCommentCount() { return commentCount; }
    public List<String> getImages() { return images; }
    public Boolean getPrivate() { return isPrivate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public List<String> getHashtags() { return hashtags; }

    public Boolean getLiked() {
        return isLiked;
    }

    public void setLiked(Boolean liked) {
        this.isLiked = liked;
    }


}
