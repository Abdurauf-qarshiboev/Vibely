package com.webdev.project.backend.rabbitmq;

import com.webdev.project.backend.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationFollowMessage implements Serializable {
    private Long userId;          // Recipient user ID
    private Long fromUserId;      // Actor user ID
    private Long followId;        // Follow ID used to approve/reject request
    private NotificationType type;
}