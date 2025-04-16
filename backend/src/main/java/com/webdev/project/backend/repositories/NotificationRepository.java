package com.webdev.project.backend.repositories;

import com.webdev.project.backend.entities.Notification;
import com.webdev.project.backend.entities.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findAllByReadFalseAndUserIs(User user);

    List<Notification> findAllByUserIs(User user);

    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.read = true, n.updatedAt = CURRENT_TIMESTAMP " +
            "WHERE n.read = false AND n.user.username = :username")
    void markAllAsRead(@Param("username") String username);


}
