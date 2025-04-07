package com.webdev.project.backend.requests;

import com.webdev.project.backend.enums.UserRole;

public class UserUpdateRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private UserRole role;
    private String bio;
    private String avatar;
    private Boolean is_private;
    private Boolean is_verified;

    // Getters and Setters
    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public Boolean isPrivate() {
        return is_private;
    }

    public void setPrivate(Boolean is_private) {
        this.is_private = is_private;
    }

    public Boolean isVerified() {
        return is_verified;
    }

    public void setVerified(Boolean is_verified) {
        this.is_verified = is_verified;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }
}
