package com.webdev.project.backend.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webdev.project.backend.dto.UserDTO;
import com.webdev.project.backend.entities.User;
import com.webdev.project.backend.enums.UserRole;
import com.webdev.project.backend.repositories.UserRepository;
import com.webdev.project.backend.requests.RegistrationRequest;
import com.webdev.project.backend.responses.LoginSuccessResponse;
import com.webdev.project.backend.services.CustomUserDetailsService;
import com.webdev.project.backend.services.ImageService;
import com.webdev.project.backend.utils.JwtUtils;
import com.webdev.project.backend.requests.LoginRequest;
import com.webdev.project.backend.utils.ResponseUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.webdev.project.backend.services.UserService;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final CustomUserDetailsService userDetailsService;
    private final UserService userService;
    private final UserRepository userRepository;
    private final ImageService imageService;

    public AuthController(AuthenticationManager authenticationManager, JwtUtils jwtUtils, CustomUserDetailsService userDetailsService, UserService userService, UserRepository userRepository, ImageService imageService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
        this.userService = userService;
        this.userRepository = userRepository;
        this.imageService = imageService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getUsername());
            String token = jwtUtils.generateToken(userDetails.getUsername());
            Optional<User> userOptional = userRepository.findByUsername(userDetails.getUsername());

            if (userOptional.isEmpty()) {
                return ResponseUtil.error("AUTH_001", "Invalid username or password", HttpStatus.UNAUTHORIZED);
            }

            LoginSuccessResponse response = new LoginSuccessResponse(token, new UserDTO(userOptional.get()));

            ResponseEntity<LoginSuccessResponse> originalResponse = new ResponseEntity<>(response, HttpStatus.OK);

            return ResponseUtil.success(originalResponse, "Login successful");

        } catch (BadCredentialsException e) {
            return ResponseUtil.error("AUTH_001", "Invalid username or password", HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            return ResponseUtil.error("AUTH_002", "Authentication failed", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/register")
        public ResponseEntity<?> registerUser(
                @RequestParam("request") String requestJson,
                @RequestParam(value = "avatar", required = false) MultipartFile avatarFile
    ) {
        try {
            // Convert JSON string to CreatePostRequest object
            ObjectMapper objectMapper = new ObjectMapper();
            RegistrationRequest registrationRequest = objectMapper.readValue(requestJson, RegistrationRequest.class);

            // Create a new User from the registration request
            User user = new User();
            user.setUsername(registrationRequest.getUsername());
            user.setPassword(registrationRequest.getPassword());
            user.setFirstName(registrationRequest.getFirstName());
            user.setLastName(registrationRequest.getLastName());
            user.setEmail(registrationRequest.getEmail());
            user.setPhone(registrationRequest.getPhone());
            user.setBio(registrationRequest.getBio());
            user.setAvatar(registrationRequest.getAvatar());

            // Set default values for new users
            user.setRole(UserRole.USER);
            user.setPrivate(false);
            user.setVerified(false);

            // Handle avatar upload if provided
            if (avatarFile != null && !avatarFile.isEmpty()) {
                String fileName = imageService.saveImage(avatarFile);
                String avatarUrl = imageService.getImageUrl(fileName);
                user.setAvatar(avatarUrl);
            }

            // Create the user in DB
            User createdUser = userService.createUser(user);

            return ResponseUtil.success(
                    new ResponseEntity<>(new UserDTO(createdUser), HttpStatus.CREATED),
                    "User created successfully"
            );

        } catch (BadCredentialsException e) {
            return ResponseUtil.error("REG_002", "Invalid credentials", HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            return ResponseUtil.error("REG_001", "Registration failed: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/check-user")
    public ResponseEntity<?> checkCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Check if Authorization header exists and has the right format
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseUtil.error("AUTH_003", "Not authenticated", HttpStatus.UNAUTHORIZED);
            }

            // Extract the token
            String token = authHeader.substring(7);

            // Validate token and extract username
            String username = jwtUtils.extractUsername(token);
            if (username == null || !jwtUtils.validateToken(token, jwtUtils.extractUsername(token))) {
                return ResponseUtil.error("AUTH_003", "Invalid or expired token", HttpStatus.UNAUTHORIZED);
            }

            // Load user details and verify
            Optional<User> userOptional = userRepository.findByUsername(username);
            if (userOptional.isEmpty()) {
                return ResponseUtil.error("AUTH_004", "User not found", HttpStatus.NOT_FOUND);
            }

            // Create DTO and return response
            UserDTO userDTO = new UserDTO(userOptional.get());
            ResponseEntity<UserDTO> originalResponse = new ResponseEntity<>(userDTO, HttpStatus.OK);
            return ResponseUtil.success(originalResponse, "User authenticated");

        } catch (Exception e) {
            return ResponseUtil.error("AUTH_005", "Authentication check failed: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}