package com.webdev.project.backend.services;

import com.webdev.project.backend.entities.Post;
import com.webdev.project.backend.entities.User;
import com.webdev.project.backend.repositories.PostRepository;
import com.webdev.project.backend.repositories.UserRepository;
import com.webdev.project.backend.requests.CreatePostRequest;
import com.webdev.project.backend.requests.UpdatePostRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.AccessDeniedException;
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
        post.setIsPrivate(Boolean.TRUE.equals(request.getIsPrivate()));

//TODO        if(imageFile != null && imageFile.isEmpty()){
            /*String imageUrl = uploadImage(imageFile);
            post.setImage(imageUrl);*/
       //TODO }
       //TODO post.setHashtags(parseHashtags(request.getHashtags()));
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

        if (post.getIsPrivate()) {
            boolean isOwner = post.getUser().getId().equals(currentUser.getId());

            // Uncomment when follow logic is implemented
            // boolean isFollowing = followRepository.isFollowing(currentUser.getId(), post.getUser().getId());

            if (!isOwner /* && !isFollowing */) {
                return Optional.ofNullable(null); // treat as not visible
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
        existingPost.setIsPrivate(updatedData.getIsPrivate());
        // existingPost.setHashtags(updatedData.getHashtags());

        Post saved = postRepository.save(existingPost);
        return Optional.of(saved);
    }


    public boolean deletePost(Long postId, User currentUser) {
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


   /* public List<Post> getFeedPosts(User currentUser, int page, int size) {
        // TODO: Implement
    }*/

    public Page<Post> searchPosts(String query, int page, int limit) {
        Pageable pageable = PageRequest.of(page, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        return postRepository.searchPublicPosts(query.toLowerCase(), pageable);
    }

}
