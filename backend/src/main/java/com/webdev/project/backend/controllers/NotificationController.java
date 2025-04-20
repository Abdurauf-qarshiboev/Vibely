package com.webdev.project.backend.controllers;

import com.webdev.project.backend.dto.MarkAllReadResponseDTO;
import com.webdev.project.backend.dto.NotificationsResponseDTO;
import com.webdev.project.backend.entities.User;
import com.webdev.project.backend.exceptions.ResourceNotFoundException;
import com.webdev.project.backend.exceptions.UnauthorizedAccessException;
import com.webdev.project.backend.repositories.UserRepository;
import com.webdev.project.backend.services.NotificationService;
import com.webdev.project.backend.utils.ResponseUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Autowired
    public NotificationController(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<?> getNotifications(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "false", required = false) Boolean unreadOnly) {

        if (userDetails == null) {
            return ResponseUtil.error("NOTIFICATION_003", "Not authenticated", HttpStatus.UNAUTHORIZED);
        }

        Optional<User> currentUserOptional = userRepository.findByUsername(userDetails.getUsername());

        if (currentUserOptional.isEmpty()) {
            return ResponseUtil.error("NOTIFICATION_002", "Not authenticated", HttpStatus.UNAUTHORIZED);
        }

        User currentUser = currentUserOptional.get();

        try {

            NotificationsResponseDTO notifications = notificationService.getNotifications(currentUser, unreadOnly);
            ResponseEntity<NotificationsResponseDTO> responseEntity =  ResponseEntity.ok(notifications);
            
            return ResponseUtil.success(responseEntity, "Notifications retrieved");
        } catch (Exception e) {
            return ResponseUtil.error("NOTIFICATION_001", "Failed to retrieve notifications: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable("id") Long notificationId) {

        if (userDetails == null) {
            return ResponseUtil.error("NOTIFICATION_003", "Not authenticated", HttpStatus.UNAUTHORIZED);
        }

        Optional<User> currentUserOptional = userRepository.findByUsername(userDetails.getUsername());

        if (currentUserOptional.isEmpty()) {
            return ResponseUtil.error("NOTIFICATION_002", "Not authenticated", HttpStatus.UNAUTHORIZED);
        }

        User currentUser = currentUserOptional.get();
        
        try {
            notificationService.markAsRead(notificationId, currentUser);
            ResponseEntity<Object> responseEntity = ResponseEntity.ok().build();
            return ResponseUtil.success(responseEntity, "Notification marked as read");
        } catch (ResourceNotFoundException e) {
            return ResponseUtil.error("NOTIFICATION_005", e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (UnauthorizedAccessException e) {
            return ResponseUtil.error("NOTIFICATION_004", e.getMessage(), HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            return ResponseUtil.error("NOTIFICATION_001", "Failed to mark notification as read: " + e.getMessage(), 
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseUtil.error("NOTIFICATION_003", "Not authenticated", HttpStatus.UNAUTHORIZED);
        }

        Optional<User> currentUserOptional = userRepository.findByUsername(userDetails.getUsername());

        if (currentUserOptional.isEmpty()) {
            return ResponseUtil.error("NOTIFICATION_002", "Not authenticated", HttpStatus.UNAUTHORIZED);
        }

        User currentUser = currentUserOptional.get();

        try {
            Integer affected = notificationService.markAllAsRead(currentUser);
            
            MarkAllReadResponseDTO response = new MarkAllReadResponseDTO(affected);
            ResponseEntity<MarkAllReadResponseDTO> responseEntity =  ResponseEntity.ok(response);
            
            return ResponseUtil.success(responseEntity, "All notifications marked as read");
        } catch (Exception e) {
            return ResponseUtil.error("NOTIFICATION_001", "Failed to mark all notifications as read: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}