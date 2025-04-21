package com.webdev.project.backend.services;

import com.webdev.project.backend.entities.Hashtag;
import com.webdev.project.backend.entities.Post;
import com.webdev.project.backend.entities.User;
import com.webdev.project.backend.repositories.HashtagRepository;
import com.webdev.project.backend.repositories.PostRepository;
import com.webdev.project.backend.repositories.UserRepository;
import com.webdev.project.backend.services.ElasticsearchIndexService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Tool to reindex all existing data from the database to Elasticsearch.
 * This can be run on application startup by activating the "reindex" profile.
 * Example: java -Dspring.profiles.active=prod -jar yourapp.jar
 */
@Component
@Profile("prod")
public class ElasticsearchReindexingTool implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(ElasticsearchReindexingTool.class);

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final HashtagRepository hashtagRepository;
    private final ElasticsearchIndexService elasticsearchIndexService;

    @Autowired
    public ElasticsearchReindexingTool(
            UserRepository userRepository,
            PostRepository postRepository,
            HashtagRepository hashtagRepository,
            ElasticsearchIndexService elasticsearchIndexService) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.hashtagRepository = hashtagRepository;
        this.elasticsearchIndexService = elasticsearchIndexService;
    }

    @Override
    public void run(String... args) {
        logger.info("Starting full reindexing of all data to Elasticsearch...");
        
        // Reindex users
        reindexUsers();
        
        // Reindex hashtags
        reindexHashtags();
        
        // Reindex posts
        reindexPosts();
        
        logger.info("Reindexing complete!");
    }

    private void reindexUsers() {
        logger.info("Reindexing users...");
        List<User> users = userRepository.findAll();
        logger.info("Found {} users to reindex", users.size());
        
        for (User user : users) {
            try {
                elasticsearchIndexService.reindexUser(user);
            } catch (Exception e) {
                logger.error("Error reindexing user {}: {}", user.getUsername(), e.getMessage());
            }
        }
        
        logger.info("User reindexing complete");
    }

    private void reindexHashtags() {
        logger.info("Reindexing hashtags...");
        List<Hashtag> hashtags = hashtagRepository.findAll();
        logger.info("Found {} hashtags to reindex", hashtags.size());
        
        for (Hashtag hashtag : hashtags) {
            try {
                elasticsearchIndexService.reindexHashtag(hashtag);
            } catch (Exception e) {
                logger.error("Error reindexing hashtag {}: {}", hashtag.getName(), e.getMessage());
            }
        }
        
        logger.info("Hashtag reindexing complete");
    }

    private void reindexPosts() {
        logger.info("Reindexing posts...");
        List<Post> posts = postRepository.findAll();
        logger.info("Found {} posts to reindex", posts.size());
        
        for (Post post : posts) {
            try {
                elasticsearchIndexService.reindexPost(post);
            } catch (Exception e) {
                logger.error("Error reindexing post with ID {}: {}", post.getId(), e.getMessage());
            }
        }
        
        logger.info("Post reindexing complete");
    }
}