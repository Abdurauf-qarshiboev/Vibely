package com.webdev.project.backend.services;

import com.webdev.project.backend.dto.NotificationsResponseDTO;
import com.webdev.project.backend.entities.*;
import com.webdev.project.backend.enums.NotificationType;
import com.webdev.project.backend.exceptions.ResourceNotFoundException;
import com.webdev.project.backend.exceptions.UnauthorizedAccessException;
import com.webdev.project.backend.repositories.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Autowired
    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public NotificationsResponseDTO getNotifications(User user, Boolean unreadOnly) {
        List<Notification> notifications;
        if (unreadOnly) {
            notifications = notificationRepository.findByUserAndReadOrderByCreatedAtDesc(user, false);
        } else {
            notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        }

        Integer unreadCount = notificationRepository.countUnreadByUser(user);
        return new NotificationsResponseDTO(notifications, unreadCount);
    }

    @Transactional
    public void markAsRead(Long notificationId, User currentUser) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        
        Notification notification = notificationOpt.orElseThrow(() -> 
            new ResourceNotFoundException("Notification not found with id " + notificationId));
        
        // Security check to ensure user owns this notification
        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedAccessException("You are not authorized to access this notification");
        }
        
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public Integer markAllAsRead(User user) {
        return notificationRepository.markAllAsRead(user);
    }

    @Transactional
    public void createNotification(User user, User fromUser,
                                   NotificationType type, Post post, Comment comment) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setFromUser(fromUser);
        notification.setNotificationType(type);
        notification.setPost(post);
        notification.setComment(comment);
        notification.setRead(false);
        
        notificationRepository.save(notification);
    }
}