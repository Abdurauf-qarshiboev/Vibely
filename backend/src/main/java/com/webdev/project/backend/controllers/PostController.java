package com.webdev.project.backend.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webdev.project.backend.dto.PostDTO;
import com.webdev.project.backend.entities.Follow;
import com.webdev.project.backend.entities.Post;
import com.webdev.project.backend.entities.User;
import com.webdev.project.backend.exceptions.ResourceNotFoundException;
import com.webdev.project.backend.rabbitmq.NotificationProducer;
import com.webdev.project.backend.requests.CreatePostRequest;
import com.webdev.project.backend.requests.PostUpdateRequest;
import com.webdev.project.backend.services.*;
import com.webdev.project.backend.utils.ResponseUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("api/posts")
public class PostController {
    private final PostService postService;
    private final UserService userService;
    private final LikeService likeService;
    private final NotificationProducer notificationProducer;
    private final FollowService followService;

    @Autowired
    public PostController(PostService postService, UserService userService, LikeService likeService, NotificationProducer notificationProducer, FollowService followService) {
        this.postService = postService;
        this.userService = userService;
        this.likeService = likeService;
        this.notificationProducer = notificationProducer;
        this.followService = followService;
    }

    @PostMapping
    public ResponseEntity<?> createPost(
            @RequestParam("request") String requestJson,
            @RequestParam(value = "image", required = false) List<MultipartFile> imageFiles,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            // Convert JSON string to CreatePostRequest object
            ObjectMapper objectMapper = new ObjectMapper();
            CreatePostRequest request = objectMapper.readValue(requestJson, CreatePostRequest.class);

            Optional<User> userOptional = userService.findByUsername(userDetails.getUsername());

            if (userOptional.isEmpty()) {
                return ResponseUtil.error("POST_001", "Not authenticated", HttpStatus.UNAUTHORIZED);
            }

            User user = userOptional.get();
            Post post = postService.createPost(request, imageFiles, user);

            // Send notification to followers
            List<Follow> follows = followService.getFollowers(user);

            for (Follow follow : follows) {
                notificationProducer.sendNewPostNotification(follow.getFollower(), user, post);
            }


            ResponseEntity<PostDTO> originalResponse = ResponseEntity.status(HttpStatus.CREATED).body(new PostDTO(post));
            return ResponseUtil.success(originalResponse, "Post created successfully");
        } catch (Exception e) {
            return ResponseUtil.error("POST_002", "Error creating post: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getPostsByUser(@RequestParam("user") String username) {
        try {
            Optional<User> userOptional = userService.findByUsername(username);

            if (userOptional.isEmpty()) {
                return ResponseUtil.error("POST_003", "User not found", HttpStatus.NOT_FOUND);
            }

            User user = userOptional.get();
            List<Post> posts = postService.getPostsByUser(user);
            List<PostDTO> postDTOs = posts.stream()
                    .map(post -> createPostDTOWithLikeStatus(post, user))
                    .toList();

            ResponseEntity<List<PostDTO>> originalResponse = ResponseEntity.ok(postDTOs);
            return ResponseUtil.success(originalResponse, "Posts retrieved successfully");
        } catch (Exception e) {
            return ResponseUtil.error("POST_004", "Error retrieving posts: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<?> getMyPosts(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            Optional<User> userOptional = userService.findByUsername(userDetails.getUsername());

            if (userOptional.isEmpty()) {
                return ResponseUtil.error("POST_005", "User not found", HttpStatus.NOT_FOUND);
            }

            User user = userOptional.get();
            List<Post> posts = postService.getMyPosts(user);
            List<PostDTO> postDTOs = posts.stream()
                    .map(post -> createPostDTOWithLikeStatus(post, user))
                    .toList();

            ResponseEntity<List<PostDTO>> originalResponse = ResponseEntity.ok(postDTOs);
            return ResponseUtil.success(originalResponse, "Your posts retrieved successfully");
        } catch (Exception e) {
            return ResponseUtil.error("POST_006", "Error retrieving your posts: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPostById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            Optional<User> userOptional = userService.findByUsername(userDetails.getUsername());

            if (userOptional.isEmpty()) {
                return ResponseUtil.error("POST_007", "Not authenticated", HttpStatus.UNAUTHORIZED);
            }

            User user = userOptional.get();
            Optional<Post> postOptional = postService.getPostById(id, user);

            if (postOptional.isEmpty()) {
                return ResponseUtil.error("POST_008", "Post not found", HttpStatus.NOT_FOUND);
            }

            ResponseEntity<PostDTO> originalResponse = ResponseEntity.ok(createPostDTOWithLikeStatus(postOptional.get(), user));
            return ResponseUtil.success(originalResponse, "Post retrieved successfully");
        } catch (Exception e) {
            return ResponseUtil.error("POST_009", "Error retrieving post: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(
            @PathVariable Long id,
            @RequestBody PostUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            Optional<User> userOptional = userService.findByUsername(userDetails.getUsername());

            if (userOptional.isEmpty()) {
                return ResponseUtil.error("POST_010", "Not authenticated", HttpStatus.UNAUTHORIZED);
            }

            User user = userOptional.get();
            Optional<Post> postOptional = postService.getPostById(id, user);

            if (postOptional.isEmpty()) {
                return ResponseUtil.error("POST_011", "Post not found", HttpStatus.NOT_FOUND);
            }

            Post post = postOptional.get();
            if (request.getTitle() != null) post.setTitle(request.getTitle());
            if (request.getBody() != null) post.setBody(request.getBody());
            if (request.getPrivate() != null) post.setPrivate(request.getPrivate());

            Optional<Post> updated = postService.updatePost(id, user, post);

            if (updated.isEmpty()) {
                return ResponseUtil.error("POST_012", "Failed to update post", HttpStatus.INTERNAL_SERVER_ERROR);
            }

            ResponseEntity<PostDTO> originalResponse = ResponseEntity.ok(createPostDTOWithLikeStatus(post, user));
            return ResponseUtil.success(originalResponse, "Post updated successfully");
        } catch (Exception e) {
            return ResponseUtil.error("POST_013", "Error updating post: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Optional<User> userOptional = userService.findByUsername(userDetails.getUsername());

            if (userOptional.isEmpty()) {
                return ResponseUtil.error("POST_014", "Not authenticated", HttpStatus.UNAUTHORIZED);
            }

            User user = userOptional.get();

            // Check if post exists before deletion
            Optional<Post> postOptional = postService.getPostById(id, user);
            if (postOptional.isEmpty()) {
                return ResponseUtil.error("POST_015", "Post not found", HttpStatus.NOT_FOUND);
            }

            if (postService.deletePost(id, user)){
                ResponseEntity<Map<String, Object>> originalResponse = new ResponseEntity<>(HttpStatus.OK);
                return ResponseUtil.success(originalResponse, "Post deleted successfully");
            } else {
                return ResponseUtil.error("POST_016", "Error deleting post", HttpStatus.INTERNAL_SERVER_ERROR);
            }

        } catch (Exception e) {
            return ResponseUtil.error("POST_016", "Error deleting post: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/feed")
    public ResponseEntity<?> getFeedPosts(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            Optional<User> userOptional = userService.findByUsername(userDetails.getUsername());

            if (userOptional.isEmpty()) {
                return ResponseUtil.error("POST_017", "Not authenticated", HttpStatus.UNAUTHORIZED);
            }

            User user = userOptional.get();
            List<Post> feedPosts = postService.getFeedPosts(user);
            List<PostDTO> postDTOs = feedPosts.stream()
                    .map(post -> createPostDTOWithLikeStatus(post, user))
                    .toList();

            ResponseEntity<List<PostDTO>> originalResponse = ResponseEntity.ok(postDTOs);
            return ResponseUtil.success(originalResponse, "Feed retrieved successfully");
        } catch (Exception e) {
            return ResponseUtil.error("POST_018", "Error retrieving feed: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/explore")
    public ResponseEntity<?> getExplorePosts(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            Optional<User> userOptional = userService.findByUsername(userDetails.getUsername());

            if (userOptional.isEmpty()) {
                return ResponseUtil.error("POST_017", "Not authenticated", HttpStatus.UNAUTHORIZED);
            }

            User user = userOptional.get();
            List<Post> feedPosts = postService.getExplorePosts();
            List<PostDTO> postDTOs = feedPosts.stream()
                    .map(post -> createPostDTOWithLikeStatus(post, user))
                    .toList();

            ResponseEntity<List<PostDTO>> originalResponse = ResponseEntity.ok(postDTOs);
            return ResponseUtil.success(originalResponse, "Feed retrieved successfully");
        } catch (Exception e) {
            return ResponseUtil.error("POST_018", "Error retrieving feed: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<?> likePost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Optional<User> currentUserOptional = userService.findByUsername(userDetails.getUsername());
        if (currentUserOptional.isEmpty()) {
            return ResponseUtil.error("POST_017", "Not authenticated", HttpStatus.UNAUTHORIZED);
        }

        try {
            int updatedLikeCount = likeService.likePost(currentUserOptional.get(), id);
            return ResponseUtil.success(ResponseEntity.ok(updatedLikeCount), "Post liked successfully");
        } catch (ResourceNotFoundException e) {
            return ResponseUtil.error("POST_022", e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (IllegalStateException e) {
            return ResponseUtil.error("POST_023", e.getMessage(), HttpStatus.CONFLICT);
        } catch (Exception e) {
            return ResponseUtil.error("POST_024", "Failed to like post: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @DeleteMapping("/{id}/unlike")
    public ResponseEntity<?> unlikePost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Optional<User> currentUserOptional = userService.findByUsername(userDetails.getUsername());
        if (currentUserOptional.isEmpty()) {
            return ResponseUtil.error("POST_017", "Not authenticated", HttpStatus.UNAUTHORIZED);
        }

        try {
            int updatedLikeCount = likeService.unlikePost(id, currentUserOptional.get());
            return ResponseUtil.success(ResponseEntity.ok(updatedLikeCount), "Post unliked successfully");
        } catch (ResourceNotFoundException e) {
            return ResponseUtil.error("POST_025", e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return ResponseUtil.error("POST_026", e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return ResponseUtil.error("POST_027", "Failed to unlike post: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @GetMapping("/{id}/likes")
    public ResponseEntity<?> getPostLikesCount(
            @PathVariable Long id
    ) {
        try {
            int likeCount = likeService.getPostLikes(id).size();
            return ResponseUtil.success(ResponseEntity.ok(likeCount), "Fetched post like count successfully");
        } catch (ResourceNotFoundException e) {
            return ResponseUtil.error("POST_028", e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return ResponseUtil.error("POST_029", "Failed to fetch post likes: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    @GetMapping("/search")
    public ResponseEntity<?> searchPosts(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "hashtag", required = false) String hashtag,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            // Check if at least one search parameter is provided
            if ((query == null || query.isEmpty()) && (hashtag == null || hashtag.isEmpty())) {
                return ResponseUtil.error("POST_022", "At least one search parameter (q or hashtag) is required", HttpStatus.BAD_REQUEST);
            }

            if (userDetails == null) {
                return ResponseUtil.error("POST_025", "User not authenticated", HttpStatus.UNAUTHORIZED);
            }

            Optional<User> userOptional = userService.findByUsername(userDetails.getUsername());

            if (userOptional.isEmpty()) {
                return ResponseUtil.error("POST_024", "User not found", HttpStatus.NOT_FOUND);
            }

            User user = userOptional.get();

            List<Post> matchedPosts = postService.searchPosts(query, hashtag);
            List<PostDTO> postDTOs = matchedPosts.stream()
                    .map(post -> createPostDTOWithLikeStatus(post, user))
                    .toList();

            ResponseEntity<List<PostDTO>> originalResponse = ResponseEntity.ok(postDTOs);
            return ResponseUtil.success(originalResponse, "Search results retrieved successfully");
        } catch (Exception e) {
            return ResponseUtil.error("POST_023", "Error searching posts: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Helper method to retrieve like status of the user for the post
    private PostDTO createPostDTOWithLikeStatus(Post post, User currentUser) {
        PostDTO postDTO = new PostDTO(post);
        try {
            boolean isLiked = likeService.isPostLikedByUser(post.getId(), currentUser);
            postDTO.setLiked(isLiked);
        } catch (Exception e) {
            postDTO.setLiked(false);
        }
        return postDTO;
    }
}