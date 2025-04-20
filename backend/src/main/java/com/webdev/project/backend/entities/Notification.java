package com.webdev.project.backend.entities;

import com.webdev.project.backend.enums.NotificationType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;

@Getter
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_user_id")
    private User fromUser;

    @Setter
    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false)
    private NotificationType notificationType;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post post;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id")
    private Comment comment;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "follow_id")
    private Follow follow;

    @Setter
    @Column(name = "read", nullable = false)
    private Boolean read = false;

    @CreationTimestamp
    private Timestamp createdAt;

    public Notification() {
    }

    public Notification(Long id, User user, User fromUser, NotificationType notificationType,
                        Post post, Comment comment, Boolean read, Timestamp createdAt) {
        this.id = id;
        this.user = user;
        this.fromUser = fromUser;
        this.notificationType = notificationType;
        this.post = post;
        this.comment = comment;
        this.read = read;
        this.createdAt = createdAt;
    }
}