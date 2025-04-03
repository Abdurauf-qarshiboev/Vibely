package com.webdev.project.backend.controllers;

import com.webdev.project.backend.dto.PostDTO;
import com.webdev.project.backend.entities.Post;
import com.webdev.project.backend.entities.User;
import com.webdev.project.backend.requests.CreatePostRequest;
import com.webdev.project.backend.requests.PostUpdateRequest;
import com.webdev.project.backend.services.PostService;
import com.webdev.project.backend.services.UserService;
import com.webdev.project.backend.utils.ResponseUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("api/posts")
public class PostController {
    private final PostService postService;
    private final UserService userService;

    @Autowired
    public PostController(PostService postService, UserService userService) {
        this.postService = postService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<?> createPost(
            @RequestBody CreatePostRequest request,
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            Optional<User> userOptional = userService.findByUsername(userDetails.getUsername());

            if (userOptional.isEmpty()) {
                return ResponseUtil.error("POST_001", "Not authenticated", HttpStatus.UNAUTHORIZED);
            }

            User user = userOptional.get();
            Post post = postService.createPost(request, imageFile, user);

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
            List<PostDTO> postDTOs = posts.stream().map(PostDTO::new).toList();

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
            List<PostDTO> postDTOs = posts.stream().map(PostDTO::new).toList();

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

            ResponseEntity<PostDTO> originalResponse = ResponseEntity.ok(new PostDTO(postOptional.get()));
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

            ResponseEntity<PostDTO> originalResponse = ResponseEntity.ok(new PostDTO(updated.get()));
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
                ResponseEntity<Void> originalResponse = ResponseEntity.status(HttpStatus.NO_CONTENT).build();
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
                    .map(PostDTO::new)
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
        // TODO: Implement logic to like a post after Like entity is ready
        return ResponseUtil.error("POST_019", "Like functionality not implemented yet", HttpStatus.NOT_IMPLEMENTED);
    }

    @DeleteMapping("/{id}/like")
    public ResponseEntity<?> unlikePost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // TODO: Implement logic to unlike a post after Like entity is ready
        return ResponseUtil.error("POST_020", "Unlike functionality not implemented yet", HttpStatus.NOT_IMPLEMENTED);
    }

    @GetMapping("/{id}/likes")
    public ResponseEntity<?> getPostLikes(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // TODO: Implement logic to retrieve users who liked the post
        return ResponseUtil.error("POST_021", "Fetching post likes not implemented yet", HttpStatus.NOT_IMPLEMENTED);
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

            List<Post> matchedPosts = postService.searchPosts(query, hashtag);
            List<PostDTO> postDTOs = matchedPosts.stream()
                    .map(PostDTO::new)
                    .toList();

            ResponseEntity<List<PostDTO>> originalResponse = ResponseEntity.ok(postDTOs);
            return ResponseUtil.success(originalResponse, "Search results retrieved successfully");
        } catch (Exception e) {
            return ResponseUtil.error("POST_023", "Error searching posts: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}