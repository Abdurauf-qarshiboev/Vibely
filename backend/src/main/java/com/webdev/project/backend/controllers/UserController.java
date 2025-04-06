package com.webdev.project.backend.controllers;

import com.webdev.project.backend.dto.UserDTO;
import com.webdev.project.backend.entities.User;
import com.webdev.project.backend.requests.UserUpdateRequest;
import com.webdev.project.backend.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@Validated
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }
    // Get user by username
    @GetMapping("/{username}")
    public ResponseEntity<UserDTO> getUserByUsername(@PathVariable String username) {
        Optional<User> user = userService.findByUsername(username);

        return user.map(UserDTO::new)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // Update user by username
    @PutMapping("/{username}")
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable String username,
            @RequestBody UserUpdateRequest request) {

        Optional<User> userOptional = Optional.ofNullable(userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found")));

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        User user = userOptional.get();

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getRole() != null) user.setRole(request.getRole());

        User updatedUser = userService.updateUser(user);

        return ResponseEntity.ok(new UserDTO(updatedUser));
    }


    // Delete user by id
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}