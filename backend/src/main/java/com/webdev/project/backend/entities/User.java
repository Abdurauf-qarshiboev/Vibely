package com.webdev.project.backend.entities;

import com.webdev.project.backend.enums.UserRole;
import com.webdev.project.backend.utils.PasswordUtils;
import jakarta.persistence.*;
import jakarta.validation.ValidationException;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Timestamp;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String firstName;
    private String lastName;
    private String bio;

    private String avatar;

    @Column(nullable = false, unique = true)
    private String email;
    @Column(nullable = false, unique = true)
    private String phone;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private UserRole role = UserRole.USER;

    @Column(nullable = false)
    private Boolean is_private = false;
    @Column(nullable = false)
    private Boolean is_verified = false;

    @CreationTimestamp
    private Timestamp created_at;

    @UpdateTimestamp
    private Timestamp updated_at;

    public User(UserRole role, String phone, String email, String lastName, String firstName, String password, String username) {
        this.role = role;
        this.phone = phone;
        this.email = email;
        this.lastName = lastName;
        this.firstName = firstName;
        this.username = username;
        setPassword(password);
    }

    public User() {}

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

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {

        if (!PasswordUtils.isSecure(password)) {
            throw new ValidationException("Password is not secure enough");
        }

        this.password = PasswordUtils.hash(password);
    }

    public Long getId() {
        return id;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public Timestamp getUpdated_at() {
        return updated_at;
    }

    public Timestamp getCreated_at() {
        return created_at;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
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
}
