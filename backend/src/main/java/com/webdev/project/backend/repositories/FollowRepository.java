package com.webdev.project.backend.repositories;

import com.webdev.project.backend.entities.Follow;
import com.webdev.project.backend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {

    Optional<Follow> findByFollowerAndFollowed(User follower, User followed);

    List<Follow> findByFollowedAndIsApprovedTrue(User followed);

    List<Follow> findByFollowerAndIsApprovedTrue(User follower);

    List<Follow> findByFollowedAndIsApprovedFalse(User followed);
}