package com.webdev.project.backend.dto;

import com.webdev.project.backend.entities.Notification;

import java.sql.Timestamp;

public class NotificationDTO {
    private final Long id;
    private final String type;
    private final Boolean read;
    private final Timestamp createdAt;
    private final UserDTO fromUser;
    private final PostDTO post;
    private final CommentDTO comment;

    public NotificationDTO(Notification notification) {
        this.id = notification.getId();
        this.type = notification.getNotificationType().name();
        this.read = notification.getRead();
        this.createdAt = notification.getCreatedAt();
        this.fromUser = notification.getFromUser() != null ? new UserDTO(notification.getFromUser()) : null;
        this.post = notification.getPost() != null ? new PostDTO(notification.getPost()) : null;
        this.comment = notification.getComment() != null ? new CommentDTO(notification.getComment()) : null;
    }

    public Long getId() { return id; }
    public String getType() { return type; }
    public Boolean getRead() { return read; }
    public Timestamp getCreatedAt() { return createdAt; }
    public UserDTO getFromUser() { return fromUser; }
    public PostDTO getPost() { return post; }
    public CommentDTO getComment() { return comment; }
}