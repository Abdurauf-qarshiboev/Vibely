package com.webdev.project.backend.services;

import com.webdev.project.backend.entities.Post;
import com.webdev.project.backend.entities.User;
import com.webdev.project.backend.repositories.PostRepository;
import com.webdev.project.backend.repositories.UserRepository;
import com.webdev.project.backend.requests.CreatePostRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public PostService(PostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    public Post createPost(CreatePostRequest request, MultipartFile imageFile, User currentUser) {
        Post post = new Post();
        post.setUser(currentUser);
        post.setTitle(request.getTitle());
        post.setBody(request.getBody());
        post.setPrivate(Boolean.TRUE.equals(request.getPrivate()));

        return postRepository.save(post);
    }

    private List<String> parseHashtags(String hashtags) {
        if (hashtags == null || hashtags.isBlank()) return List.of();
        return Arrays.stream(hashtags.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    public Optional<Post> getPostById(Long postId, User currentUser) {
        Optional<Post> optionalPost = postRepository.findById(postId);

        if (optionalPost.isEmpty()) {
            return Optional.empty(); // let controller handle it
        }

        Post post = optionalPost.get();

        if (post.getPrivate()) {
            boolean isOwner = post.getUser().getId().equals(currentUser.getId());

            // Uncomment when follow logic is implemented
            // boolean isFollowing = followRepository.isFollowing(currentUser.getId(), post.getUser().getId());

            if (!isOwner /* && !isFollowing */) {
                return Optional.empty(); // treat as not visible
            }
        }

        return Optional.of(post);
    }

    public Optional<Post> updatePost(Long postId, User currentUser, Post updatedData) {
        Optional<Post> optionalPost = postRepository.findById(postId);

        if (optionalPost.isEmpty()) {
            return Optional.empty();
        }

        Post existingPost = optionalPost.get();

        if (!existingPost.getUser().getId().equals(currentUser.getId())) {
            return Optional.empty();
        }

        existingPost.setTitle(updatedData.getTitle());
        existingPost.setBody(updatedData.getBody());
        existingPost.setImage(updatedData.getImage());
        existingPost.setPrivate(updatedData.getPrivate());
        // existingPost.setHashtags(updatedData.getHashtags());

        Post saved = postRepository.save(existingPost);
        return Optional.of(saved);
    }

    public List<Post> getPostsByUser(User user) {
        // TODO: Implement allowing private posts only when a user accepted follow from that user (1)
        return postRepository.findByUserAndIsPrivateFalse(user);
    }

    public List<Post> getMyPosts(User currentUser) {
        return postRepository.findByUser(currentUser);
    }

    public Boolean deletePost(Long postId, User currentUser) {
        Optional<Post> optionalPost = postRepository.findById(postId);

        if (optionalPost.isEmpty()) {
            return false;
        }

        Post post = optionalPost.get();

        if (!post.getUser().getId().equals(currentUser.getId())) {
            return false;
        }

        postRepository.delete(post);

        return true;
    }


    public List<Post> getFeedPosts(User user) {
        // TODO: Implement allowing private posts only when a user accepted follow from that user (2)
        return postRepository.findByUserIsNotAndIsPrivateFalse(user); // Get all public posts that are not from current user
    }


    public List<Post> searchPosts(String query, String hashtag) {
        if (hashtag != null && !hashtag.isBlank()) {
            if (query != null && !query.isBlank()) {
                return postRepository.searchPublicPosts(query.toLowerCase());
            } else {
                return postRepository.searchPublicPosts(hashtag.toLowerCase());
            }
        }

        return postRepository.searchPublicPosts(query == null ? "" : query.toLowerCase());
    }

}
