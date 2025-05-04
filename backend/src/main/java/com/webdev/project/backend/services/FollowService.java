package com.webdev.project.backend.services;

import com.webdev.project.backend.entities.Follow;
import com.webdev.project.backend.entities.User;
import com.webdev.project.backend.exceptions.ResourceNotFoundException;
import com.webdev.project.backend.rabbitmq.NotificationProducer;
import com.webdev.project.backend.repositories.FollowRepository;
import com.webdev.project.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final NotificationProducer notificationProducer;

    @Autowired
    public FollowService(FollowRepository followRepository, UserRepository userRepository, NotificationProducer notificationProducer) {
        this.followRepository = followRepository;
        this.userRepository = userRepository;
        this.notificationProducer = notificationProducer;
    }

    @Transactional
    public Follow followUser(User follower, String usernameToFollow) {
        User followed = userRepository.findByUsername(usernameToFollow)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + usernameToFollow));

        // Check if already following
        Optional<Follow> existingFollow = followRepository.findByFollowerAndFollowed(follower, followed);

        if (existingFollow.isPresent()) {
            return null;
        }

        // Check if the user to follow is private
        boolean requiresApproval = followed.isPrivate() != null && followed.isPrivate();

        Follow follow = new Follow(follower, followed, !requiresApproval);
        Follow savedFollow = followRepository.save(follow);

        // Notification (async)
        if (savedFollow.getIsApproved()) {
            notificationProducer.sendFollowNotification(followed, follower);
        } else {
            notificationProducer.sendFollowRequestNotification(followed, follower, savedFollow);
        }


        return savedFollow;
    }

    @Transactional
    public void unfollowUser(User follower, String usernameToUnfollow) {
        User followed = userRepository.findByUsername(usernameToUnfollow)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + usernameToUnfollow));

        Follow follow = followRepository.findByFollowerAndFollowed(follower, followed)
                .orElseThrow(() -> new ResourceNotFoundException("Follow relationship not found"));

        followRepository.delete(follow);
    }

    @Transactional
    public Follow approveFollowRequest(User user, Long requestId) {
        Follow followRequest = followRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Follow request not found with id: " + requestId));

        // Ensure the user is the one being followed
        if (!followRequest.getFollowed().equals(user)) {
            throw new IllegalArgumentException("You can only approve follow requests sent to you");
        }

        // Check if it's a pending request
        if (followRequest.getIsApproved()) {
            return followRequest;
        }

        followRequest.setIsApproved(true);
        Follow savedFollow = followRepository.save(followRequest);

        // Notification (async)
        if (savedFollow.getIsApproved()){
            notificationProducer.sendFollowRequestAcceptNotification(followRequest.getFollower(), followRequest.getFollowed());
        }

        return savedFollow;
    }

    @Transactional
    public void rejectFollowRequest(User user, Long requestId) {

        Follow followRequest = followRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Follow request not found with id: " + requestId));

        // Ensure the user is the one being followed
        if (!followRequest.getFollowed().equals(user)) {
            throw new IllegalArgumentException("You can only reject follow requests sent to you");
        }

        followRepository.delete(followRequest);

        // Notification (async)
        notificationProducer.sendFollowRequestRejectNotification(followRequest.getFollower(), followRequest.getFollowed());

    }

    public List<Follow> getFollowers(User user) {
        return followRepository.findByFollowedAndIsApprovedTrue(user);
    }

    public List<Follow> getFollowing(User user) {
        return followRepository.findByFollowerAndIsApprovedTrue(user);
    }

    public boolean isFollowing(User follower, User followed) {
        Optional<Follow> follow = followRepository.findByFollowerAndFollowedAndIsApproved(follower, followed, Boolean.TRUE);
        return follow.isPresent();
    }

    public List<Follow> getPendingFollowRequests(User user) {
        return followRepository.findByFollowedAndIsApprovedFalse(user);
    }

    public Integer getFollowersCount(User user) {
        return followRepository.getFollowsCountByFollowed(user);
    }

    public Integer getFollowingsCount(User user) {
        return followRepository.getFollowsCountByFollower(user);
    }

    public Boolean isFollowerFollowed(User follower, User followed) {
        return followRepository.existsByFollowerAndFollowedAndIsApprovedTrue(follower, followed);
    }
}