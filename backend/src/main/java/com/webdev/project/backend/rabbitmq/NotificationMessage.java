package com.webdev.project.backend.rabbitmq;

import com.webdev.project.backend.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationMessage implements Serializable {
    private Long userId;          // Recipient user ID
    private Long fromUserId;      // Actor user ID
    private NotificationType type;
    private Long postId;
    private Long commentId;
}