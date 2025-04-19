package com.webdev.project.backend.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webdev.project.backend.dto.UserDTO;
import com.webdev.project.backend.dto.UserExtendedDTO;
import com.webdev.project.backend.entities.User;
import com.webdev.project.backend.requests.UserUpdateRequest;
import com.webdev.project.backend.services.FollowService;
import com.webdev.project.backend.services.ImageService;
import com.webdev.project.backend.services.UserService;
import com.webdev.project.backend.utils.ResponseUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@Validated
public class UserController {

    private final UserService userService;
    private final FollowService followService;
    private final ImageService imageService;

    @Autowired
    public UserController(UserService userService, FollowService followService, ImageService imageService) {
        this.userService = userService;
        this.followService = followService;
        this.imageService = imageService;
    }

    // Get user by username
    @GetMapping("/{username}")
    public ResponseEntity<?> getUserByUsername(@PathVariable String username) {

        try {
            Optional<User> user = userService.findByUsername(username);

            if (user.isEmpty()) {
                return ResponseUtil.error("UBU_002", "User profile is not found", HttpStatus.NOT_FOUND);
            }

            UserExtendedDTO userDTO = new UserExtendedDTO(user.get());
            userDTO.setFollowerCount(followService.getFollowersCount(user.get()));
            userDTO.setFollowingCount(followService.getFollowingsCount(user.get()));

            return ResponseUtil.success(
                    new ResponseEntity<>(userDTO, HttpStatus.CREATED),
                    "User profile retrieved"
            );
        } catch (Exception e) {
            return ResponseUtil.error("UBU_001", "Internal Server Error: " + e.getMessage() , HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    // Update user by username
    @PutMapping("/profile")
    public ResponseEntity<?> updateUser(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("request") String requestJson,
            @RequestParam(value = "avatar", required = false) MultipartFile avatarFile) {

        try {
            Optional<User> userOptional = userService.findByUsername(userDetails.getUsername());

            if (userOptional.isEmpty()) {
                return ResponseUtil.error("UU_002", "User profile is not found", HttpStatus.NOT_FOUND);
            }

            // Convert JSON string to CreatePostRequest object
            ObjectMapper objectMapper = new ObjectMapper();
            UserUpdateRequest request = objectMapper.readValue(requestJson, UserUpdateRequest.class);

            User user = userOptional.get();

            if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
            if (request.getLastName() != null) user.setLastName(request.getLastName());
            if (request.getEmail() != null) user.setEmail(request.getEmail());
            if (request.getPhone() != null) user.setPhone(request.getPhone());
            if (request.getRole() != null) user.setRole(request.getRole());
            if (request.getAvatar() != null) user.setAvatar(request.getAvatar());
            if (request.getBio() != null) user.setBio(request.getBio());
            if (request.isPrivate() != null) user.setPrivate(request.isPrivate());
            if (request.isVerified() != null) user.setVerified(request.isVerified());

            // Handle avatar upload if provided
            if (avatarFile != null && !avatarFile.isEmpty()) {
                String fileName = imageService.saveImage(avatarFile);
                user.setAvatar(fileName);
            }

            User updatedUser = userService.updateUser(user);

            return ResponseUtil.success(
                    new ResponseEntity<>(new UserDTO(updatedUser), HttpStatus.CREATED),
                    "Profile updated successfully"
            );
        } catch (Exception e) {
            return ResponseUtil.error("UU_001", "Internal Server Error", HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }
}