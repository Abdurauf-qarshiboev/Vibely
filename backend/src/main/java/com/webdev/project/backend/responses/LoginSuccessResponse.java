package com.webdev.project.backend.responses;

import com.webdev.project.backend.dto.UserDTO;
import com.webdev.project.backend.entities.User;

public class LoginSuccessResponse {

    private String token;
    private UserDTO user;

    public LoginSuccessResponse(String token, UserDTO user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }
}
