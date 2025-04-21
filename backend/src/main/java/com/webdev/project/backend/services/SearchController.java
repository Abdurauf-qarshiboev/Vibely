package com.webdev.project.backend.services;

import com.webdev.project.backend.dto.HashtagDTO;
import com.webdev.project.backend.dto.PostDTO;
import com.webdev.project.backend.dto.UserDTO;
import com.webdev.project.backend.elasticsearch.document.HashtagDocument;
import com.webdev.project.backend.elasticsearch.document.PostDocument;
import com.webdev.project.backend.elasticsearch.document.UserDocument;
import com.webdev.project.backend.elasticsearch.repository.HashtagSearchRepository;
import com.webdev.project.backend.elasticsearch.repository.PostSearchRepository;
import com.webdev.project.backend.elasticsearch.repository.UserSearchRepository;
import com.webdev.project.backend.entities.Hashtag;
import com.webdev.project.backend.entities.Post;
import com.webdev.project.backend.entities.User;
import com.webdev.project.backend.utils.ResponseUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final UserSearchRepository userSearchRepository;
    private final PostSearchRepository postSearchRepository;
    private final HashtagSearchRepository hashtagSearchRepository;
    
    private final UserService userService;
    private final PostService postService;
    private final HashtagService hashtagService;
    private final LikeService likeService;

    @Autowired
    public SearchController(
            UserSearchRepository userSearchRepository,
            PostSearchRepository postSearchRepository,
            HashtagSearchRepository hashtagSearchRepository,
            UserService userService,
            PostService postService,
            HashtagService hashtagService,
            LikeService likeService) {
        this.userSearchRepository = userSearchRepository;
        this.postSearchRepository = postSearchRepository;
        this.hashtagSearchRepository = hashtagSearchRepository;
        this.userService = userService;
        this.postService = postService;
        this.hashtagService = hashtagService;
        this.likeService = likeService;
    }

    @GetMapping
    public ResponseEntity<?> search(
            @RequestParam(value = "q") String query,
            @RequestParam(value = "type", required = false) String type,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            if (query == null || query.trim().isEmpty()) {
                return ResponseUtil.error("SEARCH_001", "Search query cannot be empty", HttpStatus.BAD_REQUEST);
            }

            if (userDetails == null) {
                return ResponseUtil.error("SEARCH_002", "User not authenticated", HttpStatus.UNAUTHORIZED);
            }

            Optional<User> currentUserOptional = userService.findByUsername(userDetails.getUsername());
            if (currentUserOptional.isEmpty()) {
                return ResponseUtil.error("SEARCH_003", "User not found", HttpStatus.NOT_FOUND);
            }

            User currentUser = currentUserOptional.get();
            Map<String, Object> results = new HashMap<>();

            // If type is specified, only search that type
            if (type != null && !type.isEmpty()) {
                switch (type.toLowerCase()) {
                    case "users":
                        results.put("users", searchUsers(query));
                        break;
                    case "posts":
                        results.put("posts", searchPosts(query, currentUser));
                        break;
                    case "hashtags":
                        results.put("hashtags", searchHashtags(query));
                        break;
                    default:
                        return ResponseUtil.error("SEARCH_004", "Invalid search type. Valid types are: users, posts, hashtags", HttpStatus.BAD_REQUEST);
                }
            } else {
                // If no type is specified, search all types
                results.put("users", searchUsers(query));
                results.put("posts", searchPosts(query, currentUser));
                results.put("hashtags", searchHashtags(query));
            }

            ResponseEntity<Map<String, Object>> originalResponse = ResponseEntity.ok(results);
            return ResponseUtil.success(originalResponse, "Search results retrieved successfully");
        } catch (Exception e) {
            return ResponseUtil.error("SEARCH_005", "Error performing search: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private List<UserDTO> searchUsers(String query) {
        List<UserDocument> userDocuments = userSearchRepository.searchByNamesOrUsername(query);
        
        // Convert UserDocument to UserDTO
        return userDocuments.stream()
                .map(userDoc -> {
                    Optional<User> userOpt = userService.findById(userDoc.getId());
                    return userOpt.map(UserDTO::new).orElse(null);
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private List<PostDTO> searchPosts(String query, User currentUser) {
        List<PostDocument> postDocuments = postSearchRepository.searchByTitleOrBody(query);
        
        // Convert PostDocument to PostDTO with like status
        return postDocuments.stream()
                .map(postDoc -> {
                    Optional<Post> postOpt = postService.findById(postDoc.getId());
                    if (postOpt.isPresent()) {
                        Post post = postOpt.get();
                        // Only include public posts or posts owned by current user
                        if (!post.getPrivate() || post.getUser().getId().equals(currentUser.getId())) {
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
                    return null;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private List<HashtagDTO> searchHashtags(String query) {
        List<HashtagDocument> hashtagDocuments = hashtagSearchRepository.searchByName(query);
        
        // Convert HashtagDocument to HashtagDTO
        return hashtagDocuments.stream()
                .map(hashtagDoc -> {
                    Optional<Hashtag> hashtagOpt = hashtagService.findById(hashtagDoc.getId());
                    return hashtagOpt.map(HashtagDTO::new).orElse(null);
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    @GetMapping("/users")
    public ResponseEntity<?> searchUsers(
            @RequestParam("q") String query,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            if (query == null || query.trim().isEmpty()) {
                return ResponseUtil.error("SEARCH_006", "Search query cannot be empty", HttpStatus.BAD_REQUEST);
            }

            if (userDetails == null) {
                return ResponseUtil.error("SEARCH_007", "User not authenticated", HttpStatus.UNAUTHORIZED);
            }

            List<UserDTO> users = searchUsers(query);
            ResponseEntity<List<UserDTO>> originalResponse = ResponseEntity.ok(users);
            return ResponseUtil.success(originalResponse, "User search results retrieved successfully");
        } catch (Exception e) {
            return ResponseUtil.error("SEARCH_008", "Error searching users: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/posts")
    public ResponseEntity<?> searchPosts(
            @RequestParam("q") String query,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            if (query == null || query.trim().isEmpty()) {
                return ResponseUtil.error("SEARCH_009", "Search query cannot be empty", HttpStatus.BAD_REQUEST);
            }

            if (userDetails == null) {
                return ResponseUtil.error("SEARCH_010", "User not authenticated", HttpStatus.UNAUTHORIZED);
            }

            Optional<User> currentUserOptional = userService.findByUsername(userDetails.getUsername());
            if (currentUserOptional.isEmpty()) {
                return ResponseUtil.error("SEARCH_011", "User not found", HttpStatus.NOT_FOUND);
            }

            List<PostDTO> posts = searchPosts(query, currentUserOptional.get());
            ResponseEntity<List<PostDTO>> originalResponse = ResponseEntity.ok(posts);
            return ResponseUtil.success(originalResponse, "Post search results retrieved successfully");
        } catch (Exception e) {
            return ResponseUtil.error("SEARCH_012", "Error searching posts: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/hashtags")
    public ResponseEntity<?> searchHashtags(
            @RequestParam("q") String query,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            if (query == null || query.trim().isEmpty()) {
                return ResponseUtil.error("SEARCH_013", "Search query cannot be empty", HttpStatus.BAD_REQUEST);
            }

            if (userDetails == null) {
                return ResponseUtil.error("SEARCH_014", "User not authenticated", HttpStatus.UNAUTHORIZED);
            }

            List<HashtagDTO> hashtags = searchHashtags(query);
            ResponseEntity<List<HashtagDTO>> originalResponse = ResponseEntity.ok(hashtags);
            return ResponseUtil.success(originalResponse, "Hashtag search results retrieved successfully");
        } catch (Exception e) {
            return ResponseUtil.error("SEARCH_015", "Error searching hashtags: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}