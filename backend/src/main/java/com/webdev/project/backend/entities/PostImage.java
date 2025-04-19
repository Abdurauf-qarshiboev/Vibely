package com.webdev.project.backend.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "post_image")
public class PostImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(nullable = false, name = "post_id")
    private Post post;

    @Column(nullable = false, name = "image_url")
    private String imageUrl;

    public PostImage(Long id, Post post, String imageId) {
        this.id = id;
        this.post = post;
        this.imageUrl = imageId;
    }

    public PostImage() {

    }

    public Long getId() {
        return id;
    }

    public Post getPost() {
        return post;
    }

    public void setPost(Post post) {
        this.post = post;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageId) {
        this.imageUrl = imageId;
    }
}
