package com.webdev.project.backend.rabbitmq;

import com.webdev.project.backend.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Unified notification message that handles all notification types
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationMessage implements Serializable {
    private Long userId;          // Recipient user ID
    private Long fromUserId;      // Actor user ID
    private NotificationType type; // Type of notification

    // Fields for post/comment notifications
    private Long postId;          // Related post ID (optional)
    private Long commentId;       // Related comment ID (optional)

    // Fields for follow notifications
    private Long followId;        // Follow ID used to approve/reject request (optional)
}