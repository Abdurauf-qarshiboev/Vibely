package com.webdev.project.backend.dto;

import com.webdev.project.backend.enums.NotificationType;

import java.sql.Timestamp;

public class NotificationDTO {

    private Long id;
    private UserDTO user;
    private UserDTO fromUser;
    private NotificationType notificationType;
    private PostDTO post;
    private CommentDTO comment;
    private Boolean read;
    private Timestamp created_at;

    public Long getId() {
        return id;
    }

    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }

    public UserDTO getFromUser() {
        return fromUser;
    }

    public void setFromUser(UserDTO fromUser) {
        this.fromUser = fromUser;
    }

    public NotificationType getNotificationType() {
        return notificationType;
    }

    public void setNotificationType(NotificationType notificationType) {
        this.notificationType = notificationType;
    }

    public PostDTO getPost() {
        return post;
    }

    public void setPost(PostDTO post) {
        this.post = post;
    }

    public CommentDTO getComment() {
        return comment;
    }

    public void setComment(CommentDTO comment) {
        this.comment = comment;
    }

    public Boolean getRead() {
        return read;
    }

    public void setRead(Boolean read) {
        this.read = read;
    }

    public Timestamp getCreated_at() {
        return created_at;
    }
}
