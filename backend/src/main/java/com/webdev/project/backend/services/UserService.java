package com.webdev.project.backend.services;

import com.webdev.project.backend.entities.User;
import com.webdev.project.backend.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final ElasticsearchIndexService elasticsearchIndexService;

    @Autowired
    public UserService(UserRepository userRepository, ElasticsearchIndexService elasticsearchIndexService) {
        this.userRepository = userRepository;
        this.elasticsearchIndexService = elasticsearchIndexService;
    }

    @Transactional
    public User createUser(User user) {
        User savedUser = userRepository.save(user);
        elasticsearchIndexService.indexUser(savedUser);
        return savedUser;
    }

    @Transactional
    public User updateUser(User user) {
        User updatedUser = userRepository.save(user);
        elasticsearchIndexService.updateUserIndex(updatedUser);
        return updatedUser;

    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findByPhone(String phone) {
        return userRepository.findByPhone(phone);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
}
