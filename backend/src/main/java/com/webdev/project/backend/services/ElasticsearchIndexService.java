package com.webdev.project.backend.services;

import com.webdev.project.backend.elasticsearch.document.HashtagDocument;
import com.webdev.project.backend.elasticsearch.document.PostDocument;
import com.webdev.project.backend.elasticsearch.document.UserDocument;
import com.webdev.project.backend.elasticsearch.repository.HashtagSearchRepository;
import com.webdev.project.backend.elasticsearch.repository.PostSearchRepository;
import com.webdev.project.backend.elasticsearch.repository.UserSearchRepository;
import com.webdev.project.backend.entities.Hashtag;
import com.webdev.project.backend.entities.Post;
import com.webdev.project.backend.entities.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ElasticsearchIndexService {
    private static final Logger logger = LoggerFactory.getLogger(ElasticsearchIndexService.class);

    private final UserSearchRepository userSearchRepository;
    private final PostSearchRepository postSearchRepository;
    private final HashtagSearchRepository hashtagSearchRepository;

    @Autowired
    public ElasticsearchIndexService(
            UserSearchRepository userSearchRepository,
            PostSearchRepository postSearchRepository,
            HashtagSearchRepository hashtagSearchRepository) {
        this.userSearchRepository = userSearchRepository;
        this.postSearchRepository = postSearchRepository;
        this.hashtagSearchRepository = hashtagSearchRepository;
    }

    /**
     * USER INDEXING OPERATIONS
     */
    @Transactional
    public void indexUser(User user) {
        try {
            UserDocument userDocument = new UserDocument(user);
            userSearchRepository.save(userDocument);
            logger.info("Indexed user: {}", user.getUsername());
        } catch (Exception e) {
            logger.error("Error indexing user {}: {}", user.getUsername(), e.getMessage());
        }
    }

    @Transactional
    public void updateUserIndex(User user) {
        try {
            UserDocument userDocument = new UserDocument(user);
            userSearchRepository.save(userDocument);
            logger.info("Updated user index: {}", user.getUsername());
        } catch (Exception e) {
            logger.error("Error updating user index {}: {}", user.getUsername(), e.getMessage());
        }
    }

    @Transactional
    public void deleteUserIndex(Long userId) {
        try {
            userSearchRepository.deleteById(userId);
            logger.info("Deleted user index with ID: {}", userId);
        } catch (Exception e) {
            logger.error("Error deleting user index with ID {}: {}", userId, e.getMessage());
        }
    }

    /**
     * POST INDEXING OPERATIONS
     */
    @Transactional
    public void indexPost(Post post) {
        try {
            PostDocument postDocument = new PostDocument(post);
            postSearchRepository.save(postDocument);
            logger.info("Indexed post with ID: {}", post.getId());
        } catch (Exception e) {
            logger.error("Error indexing post with ID {}: {}", post.getId(), e.getMessage());
        }
    }

    @Transactional
    public void updatePostIndex(Post post) {
        try {
            PostDocument postDocument = new PostDocument(post);
            postSearchRepository.save(postDocument);
            logger.info("Updated post index with ID: {}", post.getId());
        } catch (Exception e) {
            logger.error("Error updating post index with ID {}: {}", post.getId(), e.getMessage());
        }
    }

    @Transactional
    public void deletePostIndex(Long postId) {
        try {
            postSearchRepository.deleteById(postId);
            logger.info("Deleted post index with ID: {}", postId);
        } catch (Exception e) {
            logger.error("Error deleting post index with ID {}: {}", postId, e.getMessage());
        }
    }

    /**
     * HASHTAG INDEXING OPERATIONS
     */
    @Transactional
    public void indexHashtag(Hashtag hashtag) {
        try {
            HashtagDocument hashtagDocument = new HashtagDocument(hashtag);
            hashtagSearchRepository.save(hashtagDocument);
            logger.info("Indexed hashtag: {}", hashtag.getName());
        } catch (Exception e) {
            logger.error("Error indexing hashtag {}: {}", hashtag.getName(), e.getMessage());
        }
    }

    @Transactional
    public void updateHashtagIndex(Hashtag hashtag) {
        try {
            HashtagDocument hashtagDocument = new HashtagDocument(hashtag);
            hashtagSearchRepository.save(hashtagDocument);
            logger.info("Updated hashtag index: {}", hashtag.getName());
        } catch (Exception e) {
            logger.error("Error updating hashtag index {}: {}", hashtag.getName(), e.getMessage());
        }
    }

    @Transactional
    public void deleteHashtagIndex(Long hashtagId) {
        try {
            hashtagSearchRepository.deleteById(hashtagId);
            logger.info("Deleted hashtag index with ID: {}", hashtagId);
        } catch (Exception e) {
            logger.error("Error deleting hashtag index with ID {}: {}", hashtagId, e.getMessage());
        }
    }

    /**
     * BULK REINDEXING
     */
    @Transactional
    public void reindexUser(User user) {
        deleteUserIndex(user.getId());
        indexUser(user);
    }

    @Transactional
    public void reindexPost(Post post) {
        deletePostIndex(post.getId());
        indexPost(post);
    }

    @Transactional
    public void reindexHashtag(Hashtag hashtag) {
        deleteHashtagIndex(hashtag.getId());
        indexHashtag(hashtag);
    }
}