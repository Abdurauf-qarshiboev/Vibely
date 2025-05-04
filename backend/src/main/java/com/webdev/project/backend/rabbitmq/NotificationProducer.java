package com.webdev.project.backend.rabbitmq;

import com.webdev.project.backend.entities.Comment;
import com.webdev.project.backend.entities.Follow;
import com.webdev.project.backend.enums.NotificationType;
import com.webdev.project.backend.entities.Post;
import com.webdev.project.backend.entities.User;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NotificationProducer {

    private final RabbitTemplate rabbitTemplate;

    @Autowired
    public NotificationProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendLikeNotification(User recipient, User actor, Post post, Comment comment, NotificationType type) {

        NotificationMessage message;

        if (type == NotificationType.LIKE_POST) {
            message = new NotificationMessage(
                    recipient.getId(),
                    actor.getId(),
                    NotificationType.LIKE_POST,
                    post.getId(),
                    null,
                    null,
                    null
            );
        } else if (type == NotificationType.LIKE_COMMENT) {
            message = new NotificationMessage(
                    recipient.getId(),
                    actor.getId(),
                    NotificationType.LIKE_COMMENT,
                    post.getId(),
                    comment.getId(),
                    null,
                    null
            );
        } else {
            return;
        }


        rabbitTemplate.convertAndSend(
                RabbitMQConfig.NOTIFICATION_EXCHANGE,
                RabbitMQConfig.NOTIFICATION_ROUTING_KEY,
                message
        );
    }

    public void sendCommentNotification(User recipient, User actor, Post post, Comment comment, NotificationType notificationType) {

        NotificationMessage message;
        if (notificationType == NotificationType.COMMENT_POST) {
            message = new NotificationMessage(
                    recipient.getId(),
                    actor.getId(),
                    notificationType,
                    post.getId(),
                    null,
                    null,
                    null
            );
        } else if (notificationType == NotificationType.COMMENT_REPLY) {
            message = new NotificationMessage(
                    recipient.getId(),
                    actor.getId(),
                    notificationType,
                    post.getId(),
                    comment.getId(),
                    null,
                    null
            );
        } else {
            return;
        }

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.NOTIFICATION_EXCHANGE,
                RabbitMQConfig.NOTIFICATION_ROUTING_KEY,
                message
        );
    }

    public void sendFollowNotification(User recipient, User actor) {
        NotificationMessage message = new NotificationMessage(
                recipient.getId(),
                actor.getId(),
                NotificationType.FOLLOW,
                null,
                null,
                null,
                null
        );

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.NOTIFICATION_EXCHANGE,
                RabbitMQConfig.NOTIFICATION_ROUTING_KEY,
                message
        );
    }

    public void sendFollowRequestNotification(User recipient, User actor, Follow follow) {
        NotificationMessage message = new NotificationMessage(
                recipient.getId(),
                actor.getId(),
                NotificationType.FOLLOW_REQUEST,
                null,
                null,
                follow.getId(),
                null
        );

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.NOTIFICATION_EXCHANGE,
                RabbitMQConfig.NOTIFICATION_ROUTING_KEY,
                message
        );
    }

    public void sendFollowRequestAcceptNotification(User recipient, User actor) {
        NotificationMessage message = new NotificationMessage(
                recipient.getId(),
                actor.getId(),
                NotificationType.FOLLOW_ACCEPT,
                null,
                null,
                null,
                null
        );

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.NOTIFICATION_EXCHANGE,
                RabbitMQConfig.NOTIFICATION_ROUTING_KEY,
                message
        );
    }

    public void sendFollowRequestRejectNotification(User recipient, User actor) {
        NotificationMessage message = new NotificationMessage(
                recipient.getId(),
                actor.getId(),
                NotificationType.FOLLOW_REJECT,
                null,
                null,
                null,
                null
        );

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.NOTIFICATION_EXCHANGE,
                RabbitMQConfig.NOTIFICATION_ROUTING_KEY,
                message
        );
    }

    public void sendNewPostNotification(User recipient, User actor, Post post) {
        NotificationMessage message = new NotificationMessage(
                recipient.getId(),
                actor.getId(),
                NotificationType.NEW_POST,
                post.getId(),
                null,
                null,
                null
        );

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.NOTIFICATION_EXCHANGE,
                RabbitMQConfig.NOTIFICATION_ROUTING_KEY,
                message
        );
    }
}