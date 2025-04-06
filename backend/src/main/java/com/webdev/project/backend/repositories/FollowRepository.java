package com.webdev.project.backend.repositories;

import com.webdev.project.backend.entities.Follow;
import com.webdev.project.backend.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {

    Optional<Follow> findByFollowerAndFollowed(User follower, User followed);

    Page<Follow> findByFollowedAndIsApprovedTrue(User followed, Pageable pageable);

    Page<Follow> findByFollowerAndIsApprovedTrue(User follower, Pageable pageable);

    Page<Follow> findByFollowedAndIsApprovedFalse(User followed, Pageable pageable);

    boolean existsByFollowerAndFollowed(User follower, User followed);
}