package com.webdev.project.backend.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webdev.project.backend.dto.UserDTO;
import com.webdev.project.backend.dto.UserExtendedDTO;
import com.webdev.project.backend.entities.User;
import com.webdev.project.backend.repositories.UserRepository;
import com.webdev.project.backend.requests.UserUpdateRequest;
import com.webdev.project.backend.services.FollowService;
import com.webdev.project.backend.services.ImageService;
import com.webdev.project.backend.services.UserService;
import com.webdev.project.backend.utils.ResponseUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@Validated
public class UserController {

    private final UserService userService;
    private final FollowService followService;
    private final ImageService imageService;
    private final RestTemplate restTemplate;
    private final UserRepository userRepository;

    @Value("${telegram.bot.token}")
    private String botToken;

    @Value("${telegram.chat.id}")
    private String chatId;

    @Autowired
    public UserController(UserService userService, FollowService followService, ImageService imageService, UserRepository userRepository) {
        this.userService = userService;
        this.followService = followService;
        this.imageService = imageService;
        this.restTemplate = new RestTemplate();
        this.userRepository = userRepository;
    }

    // Get user by username
    @GetMapping("/{username}")
    public ResponseEntity<?> getUserByUsername(
            @PathVariable String username,
            @AuthenticationPrincipal UserDetails userDetails
    ) {

        try {

            if (userDetails == null) {
                return ResponseUtil.error("UBU_005", "Not authenticated", HttpStatus.UNAUTHORIZED);
            }

            Optional<User> targetUserOptional = userService.findByUsername(username);

            if (targetUserOptional.isEmpty()) {
                return ResponseUtil.error("UBU_002", "User profile is not found", HttpStatus.NOT_FOUND);
            }

            Optional<User> currentUserOptional = userService.findByUsername(userDetails.getUsername());
            if (currentUserOptional.isEmpty()) {
                return ResponseUtil.error("UBU_002", "User profile is not found", HttpStatus.NOT_FOUND);
            }

            User targetUser = targetUserOptional.get();
            User currentUser = currentUserOptional.get();

            UserExtendedDTO userDTO = new UserExtendedDTO(targetUser);
            userDTO.setFollowerCount(followService.getFollowersCount(targetUser));
            userDTO.setFollowingCount(followService.getFollowingsCount(targetUser));
            userDTO.setFollowedByYou(followService.isFollowerFollowed(currentUser, targetUser));
            userDTO.setFollowingYou(followService.isFollowerFollowed(targetUser, currentUser));

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

    @PostMapping("/report")
    public ResponseEntity<?> sendTelegramMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody(required = false) String customMessage) {

        try {
            if (userDetails == null) {
                return ResponseUtil.error("TG_005", "Not authenticated", HttpStatus.UNAUTHORIZED);
            }

            // Example of casting to custom user class (adjust based on your app)
            Optional<User> userOptional = userRepository.findByUsername(userDetails.getUsername());

            if (userOptional.isEmpty()) {
                return ResponseUtil.error("TG_002", "User profile is not found", HttpStatus.NOT_FOUND);
            }

            User user = userOptional.get();
            String firstName = user.getFirstName();
            String lastName = user.getLastName();
            String username = user.getUsername(); // or user.getTelegramUsername()
            LocalDateTime joinedAt = user.getCreated_at().toLocalDateTime(); // adjust if using Date or other type

            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(customMessage);

            String message = """
                🔍 *Problem Report Received*

                👤 *First Name:* %s
                👤 *Last Name:* %s
                🆔 *Username:* @%s
                📅 *Joined:* %s
                🕒 *Requested:* %s
                
                🛑 *Problem:* %s
                """.formatted(
                    firstName,
                    lastName,
                    username,
                    joinedAt.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")
                    ), node.get("message").toString()
            );

            String telegramApiUrl = "https://api.telegram.org/bot" + botToken + "/sendMessage";

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("chat_id", chatId);
            requestBody.put("text", message);
            requestBody.put("parse_mode", "Markdown"); // For bold and emoji formatting

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(telegramApiUrl, requestEntity, Map.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                return ResponseUtil.success(
                        new ResponseEntity<>(response.getBody(), HttpStatus.OK),
                        "Message sent to Telegram bot successfully"
                );
            } else {
                return ResponseUtil.error("TG_003", "Failed to send message to Telegram bot", HttpStatus.BAD_REQUEST);
            }

        } catch (Exception e) {
            return ResponseUtil.error("TG_001", "Internal Server Error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}