package com.webdev.project.backend.dto;

import com.webdev.project.backend.entities.Hashtag;
import java.time.LocalDateTime;

public class HashtagDTO {
    private final Long id;
    private final String name;
    private final Integer postCount;
    private final LocalDateTime createdAt;

    public HashtagDTO(Hashtag hashtag) {
        this.id = hashtag.getId();
        this.name = hashtag.getName();
        this.postCount = hashtag.getPostCount();
        this.createdAt = hashtag.getCreatedAt();
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public Integer getPostCount() { return postCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
