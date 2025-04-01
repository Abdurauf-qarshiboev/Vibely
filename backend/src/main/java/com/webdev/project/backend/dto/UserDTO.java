package com.webdev.project.backend.dto;

import com.webdev.project.backend.entities.User;
import com.webdev.project.backend.enums.UserRole;

public class UserDTO {
    private final String username;
    private final String firstName;
    private final String lastName;
    private final String email;
    private final String phone;
    private final UserRole role;

    public UserDTO(User user) {
        this.username = user.getUsername();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.email = user.getEmail();
        this.phone = user.getPhone();
        this.role = user.getRole();
    }

    public String getUsername() { return username; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public UserRole getRole() { return role; }
}
