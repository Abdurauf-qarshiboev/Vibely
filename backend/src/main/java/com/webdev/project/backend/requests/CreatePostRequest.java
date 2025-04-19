package com.webdev.project.backend.requests;

import java.util.List;

public class CreatePostRequest {
    private String title;
    private String body;
    private Boolean isPrivate;
    private List<String> hashtags; // comma-separated string like: "sunset, travel"

    // Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title != null ? title.trim() : null;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body != null ? body.trim() : null;
    }

    public Boolean getIsPrivate() {
        return isPrivate;
    }

    public void setIsPrivate(Boolean isPrivate) {
        this.isPrivate = isPrivate;
    }

    public List<String> getHashtags() {
        return hashtags;
    }

    public void setHashtags(List<String> hashtags) {
        this.hashtags = hashtags;
    }
}
