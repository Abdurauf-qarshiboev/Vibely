package com.webdev.project.backend.controllers;

import com.webdev.project.backend.dto.UserDTO;
import com.webdev.project.backend.entities.User;
import com.webdev.project.backend.enums.UserRole;
import com.webdev.project.backend.repositories.UserRepository;
import com.webdev.project.backend.requests.RegistrationRequest;
import com.webdev.project.backend.services.CustomUserDetailsService;
import com.webdev.project.backend.utils.JwtUtils;
import com.webdev.project.backend.requests.LoginRequest;
import com.webdev.project.backend.utils.ResponseUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.webdev.project.backend.services.UserService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final CustomUserDetailsService userDetailsService;
    private final UserService userService;

    public AuthController(AuthenticationManager authenticationManager, JwtUtils jwtUtils, CustomUserDetailsService userDetailsService, UserService userService, UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
        this.userService = userService;
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

            Map<String, String> tokenMap = new HashMap<>();
            tokenMap.put("token", token);

            ResponseEntity<Map<String, String>> originalResponse = new ResponseEntity<>(tokenMap, HttpStatus.OK);

            return ResponseUtil.success(originalResponse, "Login successful");

        } catch (BadCredentialsException e) {
            return ResponseUtil.error("AUTH_001", "Invalid username or password", HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            return ResponseUtil.error("AUTH_002", "Authentication failed", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegistrationRequest registrationRequest) {
        try {

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
}