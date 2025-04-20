package com.webdev.project.backend.dto;

import com.webdev.project.backend.entities.Notification;

import java.util.List;
import java.util.stream.Collectors;

public class NotificationsResponseDTO {
    private final List<NotificationDTO> notifications;
    private final Integer unreadCount;

    public NotificationsResponseDTO(List<Notification> notifications, Integer unreadCount) {
        this.notifications = notifications.stream()
                .map(NotificationDTO::new)
                .collect(Collectors.toList());
        this.unreadCount = unreadCount;
    }

    public List<NotificationDTO> getNotifications() { return notifications; }
    public Integer getUnreadCount() { return unreadCount; }
}