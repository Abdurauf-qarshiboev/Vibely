package com.webdev.project.backend.requests;

public class CreatePostRequest {
    private String title;
    private String body;
    private Boolean isPrivate;
    private String hashtags; // comma-separated string like: "sunset, travel"

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

    public String getHashtags() {
        return hashtags != null ? hashtags.trim() : null;
    }

    public void setHashtags(String hashtags) {
        this.hashtags = hashtags != null ? hashtags.trim() : null;
    }
}
