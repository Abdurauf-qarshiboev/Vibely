package com.webdev.project.backend.rabbitmq;

import com.webdev.project.backend.entities.*;
import com.webdev.project.backend.repositories.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class NotificationConsumer {

    private static final Logger logger = LoggerFactory.getLogger(NotificationConsumer.class);

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final FollowRepository followRepository;

    @Autowired
    public NotificationConsumer(
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            PostRepository postRepository,
            CommentRepository commentRepository,
            FollowRepository followRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.followRepository = followRepository;
    }

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_QUEUE)
    public void consumeNotification(NotificationMessage message) {
        try {
            logger.info("Received notification message: {}", message);

            // Fetch required entities from repositories
            User recipient = userRepository.findById(message.getUserId())
                    .orElseThrow(() -> new RuntimeException("Recipient user not found"));

            User actor = userRepository.findById(message.getFromUserId())
                    .orElseThrow(() -> new RuntimeException("Actor user not found"));

            Post post = null;
            if (message.getPostId() != null) {
                post = postRepository.findById(message.getPostId())
                        .orElse(null); // Post might have been deleted
            }

            Comment comment = null;
            if (message.getCommentId() != null) {
                comment = commentRepository.findById(message.getCommentId())
                        .orElse(null); // Comment might have been deleted
            }

            // Create and save notification
            Notification notification = new Notification();
            notification.setUser(recipient);
            notification.setFromUser(actor);
            notification.setNotificationType(message.getType());
            notification.setPost(post);
            notification.setComment(comment);
            notification.setRead(false);

            notificationRepository.save(notification);
            logger.info("Notification saved: {}", notification.getId());
            
        } catch (Exception e) {
            logger.error("Error processing notification message: {}", e.getMessage(), e);
        }
    }

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_QUEUE)
    public void consumeNotification(NotificationFollowMessage message) {
        try {
            logger.info("Received notification message: {}", message);

            // Fetch required entities from repositories
            User recipient = userRepository.findById(message.getUserId())
                    .orElseThrow(() -> new RuntimeException("Recipient user not found"));

            User actor = userRepository.findById(message.getFromUserId())
                    .orElseThrow(() -> new RuntimeException("Actor user not found"));

            Follow follow = followRepository.getReferenceById(message.getFollowId());

            // Create and save notification
            Notification notification = new Notification();
            notification.setUser(recipient);
            notification.setFromUser(actor);
            notification.setNotificationType(message.getType());
            notification.setRead(false);
            notification.setFollow(follow);

            notificationRepository.save(notification);
            logger.info("Notification saved: {}", notification.getId());

        } catch (Exception e) {
            logger.error("Error processing notification message: {}", e.getMessage(), e);
        }
    }
}