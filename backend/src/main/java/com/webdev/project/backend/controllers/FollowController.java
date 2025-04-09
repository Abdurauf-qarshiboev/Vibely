package com.webdev.project.backend.controllers;

import com.webdev.project.backend.entities.Follow;
import com.webdev.project.backend.entities.User;
import com.webdev.project.backend.exceptions.ResourceNotFoundException;
import com.webdev.project.backend.repositories.UserRepository;
import com.webdev.project.backend.services.FollowService;
import com.webdev.project.backend.utils.ResponseUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
public class FollowController {

    private final FollowService followService;
    private final UserRepository userRepository;

    @Autowired
    public FollowController(FollowService followService, UserRepository userRepository) {
        this.followService = followService;
        this.userRepository = userRepository;
    }

    @PostMapping("/{username}/follow")
    public ResponseEntity<?> followUser(
            @PathVariable String username,
            @AuthenticationPrincipal User currentUser) {

        System.out.println("=== FOLLOW REQUEST RECEIVED ===");
        System.out.println("Current User: " + (currentUser != null ? currentUser.getUsername() : "null"));
        System.out.println("Target Username: " + username);

        try {
            Follow follow = followService.followUser(currentUser, username);

            Map<String, String> statusData = new HashMap<>();
            String message;

            if (follow.getIsApproved()) {
                statusData.put("status", "following");
                message = "User followed successfully";
            } else {
                statusData.put("status", "pending");
                message = "Follow request sent";
            }

            ResponseEntity<Map<String, String>> originalResponse = new ResponseEntity<>(statusData, HttpStatus.OK);
            return ResponseUtil.success(originalResponse, message);

        } catch (ResourceNotFoundException e) {
            e.printStackTrace();
            return ResponseUtil.error("FOLLOW_001", e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseUtil.error("FOLLOW_002", "Failed to follow user", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @DeleteMapping("/{username}/unfollow")
    public ResponseEntity<?> unfollowUser(
            @PathVariable String username,
            @AuthenticationPrincipal User currentUser) {

        try {
            followService.unfollowUser(currentUser, username);
            ResponseEntity<Object> originalResponse = new ResponseEntity<>(null, HttpStatus.OK);
            return ResponseUtil.success(originalResponse, "User unfollowed successfully");
        } catch (ResourceNotFoundException e) {
            return ResponseUtil.error("FOLLOW_003", e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return ResponseUtil.error("FOLLOW_004", "Failed to unfollow user", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{username}/followers")
    public ResponseEntity<?> getFollowers(
            @PathVariable String username,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @AuthenticationPrincipal User currentUser) {

        try {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

            // Check if profile is private and not the current user or follower
            if (Boolean.TRUE.equals(user.isPrivate()) && !user.equals(currentUser) &&
                    !followService.isFollowing(currentUser, user)) {
                return ResponseUtil.error("FOLLOW_005", "This profile is private", HttpStatus.FORBIDDEN);
            }

            Page<Follow> followers = followService.getFollowers(user, page - 1, limit);

            List<Map<String, Object>> followersList = new java.util.ArrayList<>();
            for (Follow follow : followers.getContent()) {
                User follower = follow.getFollower();
                Map<String, Object> followerMap = new HashMap<>();
                followerMap.put("id", follower.getId());
                followerMap.put("username", follower.getUsername());
                followerMap.put("firstName", follower.getFirstName());
                followerMap.put("avatar", follower.getAvatar());
                followerMap.put("verified", follower.isVerified());
                followerMap.put("following_you", followService.isFollowing(follower, currentUser));
                followersList.add(followerMap);
            }

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("followers", followersList);


            ResponseEntity<Map<String, Object>> originalResponse = new ResponseEntity<>(responseData, HttpStatus.OK);
            return ResponseUtil.success(originalResponse, "Followers retrieved");

        } catch (ResourceNotFoundException e) {
            return ResponseUtil.error("FOLLOW_006", e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return ResponseUtil.error("FOLLOW_007", "Failed to retrieve followers", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{username}/following")
    public ResponseEntity<?> getFollowing(
            @PathVariable String username,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @AuthenticationPrincipal User currentUser) {

        try {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

            // Check if profile is private and not the current user or follower
            if (Boolean.TRUE.equals(user.isPrivate()) && !user.equals(currentUser) &&
                    !followService.isFollowing(currentUser, user)) {
                return ResponseUtil.error("FOLLOW_008", "This profile is private", HttpStatus.FORBIDDEN);
            }

            Page<Follow> following = followService.getFollowing(user, page - 1, limit);

            List<Map<String, Object>> followingList = new java.util.ArrayList<>();
            for (Follow follow : following.getContent()) {
                User followed = follow.getFollowed();
                Map<String, Object> followedMap = new HashMap<>();
                followedMap.put("id", followed.getId());
                followedMap.put("username", followed.getUsername());
                followedMap.put("firstName", followed.getFirstName());
                followedMap.put("avatar", followed.getAvatar());
                followedMap.put("verified", followed.isVerified());
                followedMap.put("following_you", followService.isFollowing(followed, currentUser));
                followingList.add(followedMap);
            }

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("following", followingList);

            ResponseEntity<Map<String, Object>> originalResponse = new ResponseEntity<>(responseData, HttpStatus.OK);
            return ResponseUtil.success(originalResponse, "Following retrieved");

        } catch (ResourceNotFoundException e) {
            return ResponseUtil.error("FOLLOW_009", e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return ResponseUtil.error("FOLLOW_010", "Failed to retrieve following", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/follow-requests")
    public ResponseEntity<?> getFollowRequests(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @AuthenticationPrincipal User currentUser) {

        try {
            Page<Follow> requests = followService.getFollowRequests(currentUser, page - 1, limit);

            List<Map<String, Object>> requestsList = new java.util.ArrayList<>();
            for (Follow follow : requests.getContent()) {
                User follower = follow.getFollower();
                Map<String, Object> followerMap = new HashMap<>();
                followerMap.put("id", follower.getId());
                followerMap.put("username", follower.getUsername());
                followerMap.put("firstName", follower.getFirstName());
                followerMap.put("avatar", follower.getAvatar());
                followerMap.put("verified", follower.isVerified());
                followerMap.put("requested_at", follow.getCreatedAt());
                requestsList.add(followerMap);
            }

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("requests", requestsList);

            ResponseEntity<Map<String, Object>> originalResponse = new ResponseEntity<>(responseData, HttpStatus.OK);
            return ResponseUtil.success(originalResponse, "Follow requests retrieved");

        } catch (Exception e) {
            return ResponseUtil.error("FOLLOW_011", "Failed to retrieve follow requests", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/follow-requests/{id}/approve")
    public ResponseEntity<?> approveFollowRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        try {
            followService.approveFollowRequest(currentUser, id);
            ResponseEntity<Object> originalResponse = new ResponseEntity<>(null, HttpStatus.OK);
            return ResponseUtil.success(originalResponse, "Follow request approved");
        } catch (ResourceNotFoundException e) {
            return ResponseUtil.error("FOLLOW_012", e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return ResponseUtil.error("FOLLOW_013", e.getMessage(), HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            return ResponseUtil.error("FOLLOW_014", "Failed to approve follow request", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/follow-requests/{id}/reject")
    public ResponseEntity<?> rejectFollowRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        try {
            followService.rejectFollowRequest(currentUser, id);
            ResponseEntity<Object> originalResponse = new ResponseEntity<>(null, HttpStatus.OK);
            return ResponseUtil.success(originalResponse, "Follow request rejected");
        } catch (ResourceNotFoundException e) {
            return ResponseUtil.error("FOLLOW_015", e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return ResponseUtil.error("FOLLOW_016", e.getMessage(), HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            return ResponseUtil.error("FOLLOW_017", "Failed to reject follow request", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}