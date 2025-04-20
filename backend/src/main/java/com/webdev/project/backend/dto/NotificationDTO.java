package com.webdev.project.backend.dto;

import com.webdev.project.backend.entities.Notification;
import lombok.Getter;

import java.sql.Timestamp;

@Getter
public class NotificationDTO {
    private final Long id;
    private final String type;
    private final Boolean read;
    private final Timestamp createdAt;
    private final UserDTO fromUser;
    private final PostDTO post;
    private final Integer followId;
    private final CommentDTO comment;

    public NotificationDTO(Notification notification) {
        this.id = notification.getId();
        this.type = notification.getNotificationType().name();
        this.read = notification.getRead();
        this.createdAt = notification.getCreatedAt();
        this.fromUser = notification.getFromUser() != null ? new UserDTO(notification.getFromUser()) : null;
        this.post = notification.getPost() != null ? new PostDTO(notification.getPost()) : null;
        this.comment = notification.getComment() != null ? new CommentDTO(notification.getComment()) : null;

        if (notification.getFollow() != null) {
            this.followId = Math.toIntExact(notification.getFollow().getId());
        } else {
            this.followId = null;
        }

    }

}