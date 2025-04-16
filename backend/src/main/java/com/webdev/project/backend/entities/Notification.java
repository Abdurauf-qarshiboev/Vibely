package com.webdev.project.backend.entities;

import com.webdev.project.backend.enums.NotificationType;
import jakarta.persistence.*;

import java.sql.Timestamp;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, name = "from_user_id")
    private User fromUser;

    @Column(nullable = false, name = "notification_type")
    private NotificationType notificationType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id")
    private Comment comment;

    @Column(name = "is_read")
    private Boolean read = false;

    @Column(nullable = false, name = "updated_at")
    private Timestamp updatedAt;

    public Notification(Long id, User user, User fromUser, Post post, Comment comment, Boolean read, Timestamp updatedAt) {
        this.id = id;
        this.user = user;
        this.fromUser = fromUser;
        this.post = post;
        this.comment = comment;
        this.read = read;
        this.updatedAt = updatedAt;
    }

    public Notification() {

    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public User getFromUser() {
        return fromUser;
    }

    public void setFromUser(User fromUser) {
        this.fromUser = fromUser;
    }

    public Post getPost() {
        return post;
    }

    public void setPost(Post post) {
        this.post = post;
    }

    public Comment getComment() {
        return comment;
    }

    public void setComment(Comment comment) {
        this.comment = comment;
    }

    public Boolean getRead() {
        return read;
    }

    public void setRead(Boolean read) {
        this.read = read;
    }

    public Timestamp getUpdated_at() {
        return updatedAt;
    }

    public NotificationType getNotificationType() {
        return notificationType;
    }

    public void setNotificationType(NotificationType notificationType) {
        this.notificationType = notificationType;
    }
}
