package com.webdev.project.backend.controllers;

import com.webdev.project.backend.dto.PostDTO;
import com.webdev.project.backend.entities.Post;
import com.webdev.project.backend.entities.User;
import com.webdev.project.backend.requests.CreatePostRequest;
import com.webdev.project.backend.requests.PostUpdateRequest;
import com.webdev.project.backend.services.PostService;
import com.webdev.project.backend.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.attribute.UserPrincipal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/posts")
public class PostController {
    private final PostService postService;
    private final UserService userService;


    @Autowired
    public PostController(PostService postService, UserService userService) {
        this.postService = postService;
        this.userService = userService;
    }


    //methods
    @PostMapping
    public ResponseEntity<PostDTO> createPost(
            @ModelAttribute CreatePostRequest request,
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            @AuthenticationPrincipal UserDetails userDetails
    ) {

        Optional<User> userOptional = userService.findByUsername(userDetails.getUsername());

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userOptional.get();
        Post post = postService.createPost(request, imageFile, user);
        System.out.println("Authenticated username: " + userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(new PostDTO(post));


    }


    @GetMapping("/user/{username}")
    public ResponseEntity<List<PostDTO>> getPostsByUser(@PathVariable String username) {
        Optional<User> userOptional = userService.findByUsername(username);

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        User user = userOptional.get();
        List<Post> posts = postService.getPostsByUser(user);
        List<PostDTO> postDTOs = posts.stream().map(PostDTO::new).toList();

        return ResponseEntity.ok(postDTOs);
    }


    @GetMapping
    public ResponseEntity<List<PostDTO>> getMyPosts(@AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> userOptional = userService.findByUsername(userDetails.getUsername());

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        User user = userOptional.get();
        List<Post> posts = postService.getPostsByUser(user);

        List<PostDTO> postDTOs = posts.stream().map(PostDTO::new).toList();

        return ResponseEntity.ok(postDTOs);
    }


    @GetMapping("/{id}")
    public ResponseEntity<PostDTO> getPostById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Optional<User> userOptional = userService.findByUsername(userDetails.getUsername());

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }


        User user = userOptional.get();
        Optional<Post> postOptional = postService.getPostById(id, user);

        return postOptional.map(PostDTO::new).map(ResponseEntity::ok).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }


    @PutMapping("/{id}")
    public ResponseEntity<PostDTO> updatePost(
            @PathVariable Long id,
            @RequestBody PostUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Optional<User> userOptional = userService.findByUsername(userDetails.getUsername());

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userOptional.get();
        Optional<Post> postOptional = postService.getPostById(id, user);
        if (postOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        Post post = postOptional.get();
        if (request.getTitle() != null) post.setTitle(request.getTitle());
        if (request.getBody() != null) post.setBody(request.getBody());
        if (request.getIsPrivate() != null) post.setIsPrivate(request.getIsPrivate());
        Optional<Post> updated = postService.updatePost(id, user, post);

        return updated.map(value -> ResponseEntity.ok(new PostDTO(value))).orElseGet(() -> ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());

    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> userOptional = userService.findByUsername(userDetails.getUsername());

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userOptional.get();

        postService.deletePost(id, user);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/feed")
    public ResponseEntity<?> getFeedPosts(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Optional<User> userOptional = userService.findByUsername(userDetails.getUsername());

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        User user = userOptional.get();
        List<Post> feedPosts = postService.getFeedPosts(user);
        List<PostDTO> postDTOs = feedPosts.stream()
                .map(PostDTO::new)
                .toList();

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of("posts", postDTOs),
                "message", "Feed retrieved"
        ));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<?> likePost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // TODO: Implement logic to like a post after Like entity is ready
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(
                Map.of(
                        "success", false,
                        "message", "Like functionality not implemented yet"
                )
        );
    }

    @DeleteMapping("/{id}/like")
    public ResponseEntity<?> unlikePost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // TODO: Implement logic to unlike a post after Like entity is ready
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(
                Map.of(
                        "success", false,
                        "message", "Unlike functionality not implemented yet"
                )
        );
    }

    @GetMapping("/{id}/likes")
    public ResponseEntity<?> getPostLikes(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // TODO: Implement logic to retrieve users who liked the post
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(
                Map.of(
                        "success", false,
                        "message", "Fetching post likes not implemented yet"
                )
        );
    }


    @GetMapping("/search")
    public ResponseEntity<?> searchPosts(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "hashtag", required = false) String hashtag,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<Post> matchedPosts = postService.searchPosts(query, hashtag);

        List<PostDTO> postDTOs = matchedPosts.stream()
                .map(PostDTO::new)
                .toList();

        Map<String, Object> responseBody = Map.of(
                "success", true,
                "data", Map.of("posts", postDTOs),
                "message", "Search results retrieved"
        );

        return ResponseEntity.ok(responseBody);
    }


}
