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

    public void sendLikeNotification(User recipient, User actor, Post post, Comment comment) {

        NotificationMessage message;

        if (comment == null && post != null) {
            message = new NotificationMessage(
                    recipient.getId(),
                    actor.getId(),
                    NotificationType.LIKE_POST,
                    post.getId(),
                    null
            );
        } else if (comment != null && post == null) {
            message = new NotificationMessage(
                    recipient.getId(),
                    actor.getId(),
                    NotificationType.LIKE_COMMENT,
                    null,
                    comment.getId()
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
                    null
            );
        } else if (notificationType == NotificationType.COMMENT_REPLY) {
            message = new NotificationMessage(
                    recipient.getId(),
                    actor.getId(),
                    notificationType,
                    null,
                    comment.getId()
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
        NotificationFollowMessage message = new NotificationFollowMessage(
                recipient.getId(),
                actor.getId(),
                null,
                NotificationType.FOLLOW
        );

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.NOTIFICATION_EXCHANGE,
                RabbitMQConfig.NOTIFICATION_ROUTING_KEY,
                message
        );
    }

    public void sendFollowRequestNotification(User recipient, User actor, Follow follow) {
        NotificationFollowMessage message = new NotificationFollowMessage(
                recipient.getId(),
                actor.getId(),
                follow.getId(),
                NotificationType.FOLLOW_REQUEST
        );

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.NOTIFICATION_EXCHANGE,
                RabbitMQConfig.NOTIFICATION_ROUTING_KEY,
                message
        );
    }

    public void sendFollowRequestAcceptNotification(User recipient, User actor) {
        NotificationFollowMessage message = new NotificationFollowMessage(
                recipient.getId(),
                actor.getId(),
                null,
                NotificationType.FOLLOW_ACCEPT
        );

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.NOTIFICATION_EXCHANGE,
                RabbitMQConfig.NOTIFICATION_ROUTING_KEY,
                message
        );
    }

    public void sendFollowRequestRejectNotification(User recipient, User actor) {
        NotificationFollowMessage message = new NotificationFollowMessage(
                recipient.getId(),
                actor.getId(),
                null,
                NotificationType.FOLLOW_REJECT
        );

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.NOTIFICATION_EXCHANGE,
                RabbitMQConfig.NOTIFICATION_ROUTING_KEY,
                message
        );
    }
}