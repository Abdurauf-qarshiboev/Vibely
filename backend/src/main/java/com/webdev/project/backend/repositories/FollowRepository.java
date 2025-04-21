package com.webdev.project.backend.repositories;

import com.webdev.project.backend.entities.Follow;
import com.webdev.project.backend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {

    Optional<Follow> findByFollowerAndFollowed(User follower, User followed);

    List<Follow> findByFollowedAndIsApprovedTrue(User followed);

    List<Follow> findByFollowerAndIsApprovedTrue(User follower);

    List<Follow> findByFollowedAndIsApprovedFalse(User followed);

    Optional<Follow> findByFollowerAndFollowedAndIsApproved(User follower, User followed, Boolean isApproved);

    @Query("SELECT COUNT(f) FROM Follow f WHERE f.followed = :followed and f.isApproved = true")
    int getFollowsCountByFollowed(@Param("followed") User followed);

    @Query("SELECT COUNT(f) FROM Follow f WHERE f.follower = :follower and f.isApproved = true" )
    int getFollowsCountByFollower(@Param("follower") User follower);

    boolean existsByFollowerAndFollowedAndIsApprovedTrue(User follower, User followed);

}