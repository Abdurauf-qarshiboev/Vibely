package com.webdev.project.backend.controllers;

import com.webdev.project.backend.entities.Notification;
import com.webdev.project.backend.entities.User;
import com.webdev.project.backend.repositories.NotificationRepository;
import com.webdev.project.backend.repositories.UserRepository;
import com.webdev.project.backend.utils.ResponseUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    NotificationRepository notificationRepository;
    UserRepository userRepository;

    @Autowired
    public NotificationController(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;

    }

    @GetMapping
    public ResponseEntity<?> getNotifications(
            @RequestParam(value = "unread_only", required = false, defaultValue = "false") Boolean unreadOnly,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {

            if (userDetails == null){
                return ResponseUtil.error("FOLLOW_003", "Not authenticated", HttpStatus.UNAUTHORIZED);
            }

            Optional<User> optionalUser = userRepository.findByUsername(userDetails.getUsername());

            if (optionalUser.isEmpty()){
                return ResponseUtil.error("FOLLOW_004", "Not authenticated", HttpStatus.UNAUTHORIZED);
            }

            User user = optionalUser.get();

            List<Notification> notificationList;

            // Retrieve notifications accordingly
            if (unreadOnly){
                notificationList = notificationRepository.findAllByReadFalseAndUserIs(user);
            }else{
                notificationList = notificationRepository.findAllByUserIs(user);
            }

            Map<String, List<Notification>> notificationMap = new HashMap<>();
            notificationMap.put("notifications", notificationList);

            ResponseEntity<?> response = new ResponseEntity<>(notificationMap, HttpStatus.OK);

            return ResponseUtil.success(response, "Notifications retrieved");

        } catch (BadCredentialsException e) {
            return ResponseUtil.error("FOLLOW_001", "Bad credentials", HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            return ResponseUtil.error("FOLLOW_002", "Error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    @GetMapping({"/{id}/read"})
    public ResponseEntity<?> readNotification(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            if (userDetails == null){
                return ResponseUtil.error("FOLLOW_003", "Not authenticated", HttpStatus.UNAUTHORIZED);
            }

            Optional<Notification> optionalNotification = notificationRepository.findById(id);

            if (optionalNotification.isEmpty()){
                return ResponseUtil.error("FOLLOW_004", "Notification not found", HttpStatus.NOT_FOUND);
            }

            Notification notification = optionalNotification.get();

            // Check if the notification is for this user
            if (!notification.getUser().getUsername().equals(userDetails.getUsername())){
                return ResponseUtil.error("FOLLOW_006", "Notification not found", HttpStatus.NOT_FOUND);  // Treat as if it doesn't exist
            }

            // Mark as read
            notification.setRead(true);
            notificationRepository.save(notification);

            ResponseEntity<Map<String, Object>> responseEntity = new ResponseEntity<>(HttpStatus.OK);
            return ResponseUtil.success(responseEntity, "Notification read");
        } catch (Exception e){
            return ResponseUtil.error("FOLLOW_005", "Error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping({"/read-all"})
    public ResponseEntity<?> readAllNotifications(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            if (userDetails == null) {
                return ResponseUtil.error("FOLLOW_003", "Not authenticated", HttpStatus.UNAUTHORIZED);
            }

            notificationRepository.markAllAsRead(userDetails.getUsername());

            ResponseEntity<Map<String, Object>> responseEntity = new ResponseEntity<>(HttpStatus.OK);
            return ResponseUtil.success(responseEntity, "Notification read");
        } catch (Exception e){
            return ResponseUtil.error("FOLLOW_005", "Error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
