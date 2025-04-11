package com.webdev.project.backend.controllers;

import com.webdev.project.backend.entities.Follow;
import com.webdev.project.backend.entities.User;
import com.webdev.project.backend.exceptions.ResourceNotFoundException;
import com.webdev.project.backend.repositories.UserRepository;
import com.webdev.project.backend.services.FollowService;
import com.webdev.project.backend.utils.ResponseUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;

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
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails.getUsername().equals(username)) {
            return ResponseUtil.error("FOLLOW_002H", "Can't follow yourself", HttpStatus.CONFLICT);
        }

        Optional<User> currentUserOptional = userRepository.findByUsername(userDetails.getUsername());

        if (currentUserOptional.isEmpty()) {
            return ResponseUtil.error("FOLLOW_002X", "Not authenticated", HttpStatus.CONFLICT);
        }

        try {
            Follow follow = followService.followUser(currentUserOptional.get(), username);

            if (follow == null) {
                return ResponseUtil.error("FOLLOW_002L", "Already followed", HttpStatus.CONFLICT);
            }

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
            return ResponseUtil.error("FOLLOW_001", e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return ResponseUtil.error("FOLLOW_002", "Failed to follow user", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @DeleteMapping("/{username}/unfollow")
    public ResponseEntity<?> unfollowUser(
            @PathVariable String username,
            @AuthenticationPrincipal UserDetails userDetails) {

        Optional<User> currentUserOptional = userRepository.findByUsername(userDetails.getUsername());

        if (currentUserOptional.isEmpty()) {
            return ResponseUtil.error("FOLLOW_003", "Not authenticated", HttpStatus.CONFLICT);
        }

        try {
            followService.unfollowUser(currentUserOptional.get(), username);
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
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            Optional<User> currentUserOptional = userRepository.findByUsername(userDetails.getUsername());
            if (currentUserOptional.isEmpty()) {
                return ResponseUtil.error("FOLLOW_003", "Not authenticated", HttpStatus.CONFLICT);
            }
            User currentUser = currentUserOptional.get();

            // Fetch the user whose followers are being requested
            User targetUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

            // Check if the profile is private and access should be restricted
            if (Boolean.TRUE.equals(targetUser.isPrivate()) &&
                    !targetUser.getUsername().equals(currentUser.getUsername()) &&
                    !followService.isFollowing(currentUser, targetUser)) {
                return ResponseUtil.error("FOLLOW_005", "This profile is private", HttpStatus.FORBIDDEN);
            }

            // Fetch followers
            List<Follow> followers = followService.getFollowers(targetUser);

            // Map followers into a response format
            List<Map<String, Object>> followersList = new ArrayList<>();
            for (Follow follow : followers) {
                User follower = follow.getFollower();
                Map<String, Object> followerMap = new HashMap<>();
                followerMap.put("id", follower.getId());
                followerMap.put("username", follower.getUsername());
                followerMap.put("firstName", follower.getFirstName());
                followerMap.put("avatar", follower.getAvatar());
                followerMap.put("verified", follower.isVerified());
                followerMap.put("following_you", followService.isFollowing(currentUser, follower));
                followersList.add(followerMap);
            }

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("followers", followersList);

            return ResponseUtil.success(new ResponseEntity<>(responseData, HttpStatus.OK), "Followers retrieved");

        } catch (ResourceNotFoundException e) {
            return ResponseUtil.error("FOLLOW_006", e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return ResponseUtil.error("FOLLOW_007", "Failed to retrieve followers", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @GetMapping("/{username}/following")
    public ResponseEntity<?> getFollowing(
            @PathVariable String username,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

            User currentUser = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            // Check if profile is private and not the current user or follower
            if (Boolean.TRUE.equals(user.isPrivate()) && !user.equals(currentUser) &&
                    !followService.isFollowing(currentUser, user)) {
                return ResponseUtil.error("FOLLOW_008", "This profile is private", HttpStatus.FORBIDDEN);
            }

            List<Follow> following = followService.getFollowing(user);

            List<Map<String, Object>> followingList = new ArrayList<>();
            for (Follow follow : following) {
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

            return ResponseUtil.success(new ResponseEntity<>(responseData, HttpStatus.OK), "Following retrieved");

        } catch (ResourceNotFoundException e) {
            return ResponseUtil.error("FOLLOW_009", e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return ResponseUtil.error("FOLLOW_010", "Failed to retrieve following", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/follow-requests")
    public ResponseEntity<?> getFollowRequests(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            // Fetch follow requests (not approved yet)
            List<Follow> requests = followService.getPendingFollowRequests(currentUser);

            List<Map<String, Object>> requestsList = new ArrayList<>();

            for (Follow follow : requests) {
                User follower = follow.getFollower();
                Map<String, Object> followerMap = new HashMap<>();
                followerMap.put("request_id", follow.getId());
                followerMap.put("username", follower.getUsername());
                followerMap.put("firstName", follower.getFirstName());
                followerMap.put("avatar", follower.getAvatar());
                followerMap.put("verified", follower.isVerified());
                followerMap.put("requested_at", follow.getCreatedAt());
                requestsList.add(followerMap);
            }

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("requests", requestsList);
            return ResponseUtil.success(new ResponseEntity<>(responseData, HttpStatus.OK), "Follow requests retrieved");

        } catch (Exception e) {
            return ResponseUtil.error("FOLLOW_011", "Failed to retrieve follow requests", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @PostMapping("/follow-requests/{id}/approve")
    public ResponseEntity<?> approveFollowRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            // Extract username from UserDetails
            String username = userDetails.getUsername();

            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

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
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            String username = userDetails.getUsername();

            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

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