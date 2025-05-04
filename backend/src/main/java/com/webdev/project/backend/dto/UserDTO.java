package com.webdev.project.backend.dto;

import com.webdev.project.backend.entities.User;
import com.webdev.project.backend.enums.UserRole;

import java.sql.Timestamp;

public class UserDTO {
    private final String username;
    private final String firstName;
    private final String lastName;
    private final String email;
    private final String phone;
    private final UserRole role;
    private final String bio;
    private final String avatar;
    private final Boolean is_private;
    private final Boolean is_verified;
    private final Timestamp created_at;


    public UserDTO(User user) {
        this.username = user.getUsername();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.email = user.getEmail();
        this.phone = user.getPhone();
        this.role = user.getRole();
        this.avatar = user.getAvatar();
        this.is_private = user.isPrivate();
        this.is_verified = user.isVerified();
        this.created_at = user.getCreated_at();
        this.bio = user.getBio();
    }

    // Getters
    public String getUsername() {
        return username;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public UserRole getRole() {
        return role;
    }

    public String getBio() {
        return bio;
    }

    public String getAvatar() {
        return avatar;
    }

    public Boolean isPrivate() {
        return is_private;
    }

    public Boolean isVerified() {
        return is_verified;
    }

    public Timestamp getCreated_at() {
        return created_at;
    }
}
