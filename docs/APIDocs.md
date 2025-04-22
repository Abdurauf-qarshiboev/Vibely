# Social Media API Documentation

## Base URL
```
http://localhost:8080/api/
```

## Authentication
Most endpoints require authentication using a Bearer token in the Authorization header:
```
Authorization: Bearer {your_token}
```

## Response Format
All responses follow this general structure:
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

For errors:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

---

# User Endpoints

## Register User
Create a new user account.

**URL:** `/auth/register`\
**Method:** `POST`\
**Auth required:** No

### Request Body
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Success Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": null,
    "phone": null,
    "role": "USER",
    "private": false,
    "verified": false,
    "created_at": "2025-04-05T10:00:00Z"
  },
  "message": "User registered successfully"
}
```

## Login User
Authenticate a user and return a token.

**URL:** `/auth/login`\
**Method:** `POST`\
**Auth required:** No

### Request Body
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

## Get User Profile
Get details of a user profile.

**URL:** `/users/:username`\
**Method:** `GET`\
**Auth required:** Optional (for private profiles)

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Software developer and photography enthusiast",
    "avatar": "https://example.com/avatars/johndoe.jpg",
    "private": false,
    "verified": true,
    "post_count": 42,
    "follower_count": 156,
    "following_count": 98,
    "created_at": "2025-01-15T08:30:00Z"
  },
  "message": "User profile retrieved"
}
```

## Update User Profile
Update the authenticated user's profile information.

**URL:** `/users/profile`\
**Method:** `PUT`\
**Auth required:** Yes

### Request Body
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Updated bio information",
  "private": true
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Updated bio information",
    "avatar": "https://example.com/avatars/johndoe.jpg",
    "private": true,
    "verified": true
  },
  "message": "Profile updated successfully"
}
```

## Get User Posts
Get posts from a specific user.

**URL:** `/users/:username/posts`\
**Method:** `GET`\
**Auth required:** Optional (for private profiles)

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 42,
        "title": "My latest adventure",
        "body": "Today I went hiking in the mountains...",
        "image": "https://example.com/posts/image123.jpg",
        "like_count": 24,
        "comment_count": 5,
        "created_at": "2025-04-01T14:30:00Z",
        "user": {
          "id": 1,
          "username": "johndoe",
          "firstName": "John",
          "avatar": "https://example.com/avatars/johndoe.jpg",
          "verified": true
        },
        "hashtags": ["adventure", "hiking", "nature"]
      }
    ]
  },
  "message": "User posts retrieved"
}
```

---

# Post Endpoints

## Create Post
Create a new post.

**URL:** `/posts`\
**Method:** `POST`\
**Auth required:** Yes\
**Content-Type:** `multipart/form-data`

### Request
Form fields:
- `title`: Post title (optional)
- `body`: Post content
- `image`: Image file (optional)
- `hashtags`: Comma-separated hashtags (optional)
- `is_private`: Whether post is private (optional, default: false)

### Success Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": 55,
    "title": "Beautiful sunset",
    "body": "Captured this amazing sunset at the beach",
    "image": "https://example.com/posts/sunset123.jpg",
    "like_count": 0,
    "comment_count": 0,
    "private": false,
    "created_at": "2025-04-05T19:45:00Z",
    "hashtags": ["sunset", "beach", "photography"]
  },
  "message": "Post created successfully"
}
```

## Get Post
Get a specific post by ID.

**URL:** `/posts/:id`\
**Method:** `GET`\
**Auth required:** Optional (for private posts)

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 55,
    "title": "Beautiful sunset",
    "body": "Captured this amazing sunset at the beach",
    "image": "https://example.com/posts/sunset123.jpg",
    "like_count": 12,
    "comment_count": 3,
    "private": false,
    "created_at": "2025-04-05T19:45:00Z",
    "updated_at": null,
    "user": {
      "id": 1,
      "username": "johndoe",
      "firstName": "John",
      "avatar": "https://example.com/avatars/johndoe.jpg",
      "verified": true
    },
    "hashtags": ["sunset", "beach", "photography"],
    "liked_by_you": true
  },
  "message": "Post retrieved"
}
```

## Update Post
Update a post.

**URL:** `/posts/:id`\
**Method:** `PUT`\
**Auth required:** Yes

### Request Body
```json
{
  "title": "Updated sunset title",
  "body": "Updated description of the sunset",
  "hashtags": "sunset,beach,evening",
  "private": true
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 55,
    "title": "Updated sunset title",
    "body": "Updated description of the sunset",
    "image": "https://example.com/posts/sunset123.jpg",
    "private": true,
    "updated_at": "2025-04-05T20:30:00Z",
    "hashtags": ["sunset", "beach", "evening"]
  },
  "message": "Post updated successfully"
}
```

## Delete Post
Delete a post.

**URL:** `/posts/:id`\
**Method:** `DELETE`\
**Auth required:** Yes

### Success Response (200 OK)
```json
{
  "success": true,
  "data": null,
  "message": "Post deleted successfully"
}
```

## Get Posts by Username
Get posts for the specific user for given username.

**URL:** `/posts?user={username}`\
**Method:** `GET`\
**Auth required:** No

### Query Parameters
- `username`: Only posts by this username


### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 56,
        "title": "Morning coffee",
        "body": "Starting my day with a perfect cup of coffee",
        "image": "https://example.com/posts/coffee123.jpg",
        "like_count": 8,
        "comment_count": 2,
        "created_at": "2025-04-05T08:15:00Z",
        "user": {
          "id": 2,
          "username": "janedoe",
          "firstName": "Jane",
          "avatar": "https://example.com/avatars/janedoe.jpg",
          "verified": false
        },
        "hashtags": ["coffee", "morning"],
        "liked_by_you": false
      }
    ]
  },
  "message": "User posts retrieved"
}
```

## Get User Posts
Get posts for the authenticated user. (posted by the user himself).

**URL:** `/posts`\
**Method:** `GET`\
**Auth required:** Yes


### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 56,
        "title": "Morning coffee",
        "body": "Starting my day with a perfect cup of coffee",
        "image": "https://example.com/posts/coffee123.jpg",
        "like_count": 8,
        "comment_count": 2,
        "created_at": "2025-04-05T08:15:00Z",
        "user": {
          "id": 2,
          "username": "janedoe",
          "firstName": "Jane",
          "avatar": "https://example.com/avatars/janedoe.jpg",
          "verified": false
        },
        "hashtags": ["coffee", "morning"],
        "liked_by_you": false
      }
    ]
  },
  "message": "User posts retrieved"
}
```

## Get Feed Posts
Get posts for the authenticated user's feed (from followed users).

**URL:** `/posts/feed`\
**Method:** `GET`\
**Auth required:** Yes


### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 56,
        "title": "Morning coffee",
        "body": "Starting my day with a perfect cup of coffee",
        "image": "https://example.com/posts/coffee123.jpg",
        "like_count": 8,
        "comment_count": 2,
        "created_at": "2025-04-05T08:15:00Z",
        "user": {
          "id": 2,
          "username": "janedoe",
          "firstName": "Jane",
          "avatar": "https://example.com/avatars/janedoe.jpg",
          "verified": false
        },
        "hashtags": ["coffee", "morning"],
        "liked_by_you": false
      }
    ]
  },
  "message": "Feed retrieved"
}
```

## Like Post
Like a post.

**URL:** `/posts/:id/like`\
**Method:** `POST`\
**Auth required:** Yes

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "like_count": 13
  },
  "message": "Post liked successfully"
}
```

## Unlike Post
Remove like from a post.

**URL:** `/posts/:id/unlike`\
**Method:** `DELETE`\
**Auth required:** Yes

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "like_count": 12
  },
  "message": "Post unliked successfully"
}
```

## Get Post Likes
Get users who liked a post.

**URL:** `/posts/:id/likes`\
**Method:** `GET`\
**Auth required:** Optional

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "username": "johndoe",
        "firstName": "John",
        "avatar": "https://example.com/avatars/johndoe.jpg",
        "verified": true
      },
      {
        "id": 3,
        "username": "mikebrown",
        "firstName": "Mike",
        "avatar": "https://example.com/avatars/mikebrown.jpg",
        "verified": false
      }
    ]
  },
  "message": "Post likes retrieved"
}
```

## Search Posts
Search for posts by keywords or hashtags.

**URL:** `/posts/search`\
**Method:** `GET`\
**Auth required:** Optional

### Query Parameters
- `q`: Search query
- `hashtag`: Filter by hashtag (optional)

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 55,
        "title": "Beautiful sunset",
        "body": "Captured this amazing sunset at the beach",
        "image": "https://example.com/posts/sunset123.jpg",
        "like_count": 12,
        "comment_count": 3,
        "created_at": "2025-04-05T19:45:00Z",
        "user": {
          "id": 1,
          "username": "johndoe",
          "firstName": "John",
          "avatar": "https://example.com/avatars/johndoe.jpg",
          "verified": true
        },
        "hashtags": ["sunset", "beach", "photography"]
      }
    ]
  },
  "message": "Search results retrieved"
}
```

---

# Comment Endpoints

## Add Comment
Add a comment to a post.

**URL:** `/posts/:postId/comments`\
**Method:** `POST`\
**Auth required:** Yes

### Request Body
```json
{
  "body": "This is an amazing photo! Where was it taken?",
  "parent_comment_id": null
}
```

### Success Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": 123,
    "body": "This is an amazing photo! Where was it taken?",
    "like_count": 0,
    "reply_count": 0,
    "created_at": "2025-04-05T20:15:00Z",
    "user": {
      "id": 2,
      "username": "janedoe",
      "firstName": "Jane",
      "avatar": "https://example.com/avatars/janedoe.jpg",
      "verified": false
    }
  },
  "message": "Comment added successfully"
}
```

## Get Post Comments
Get comments for a specific post.

**URL:** `/posts/:postId/comments`\
**Method:** `GET`\
**Auth required:** Optional (for private posts)

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": 123,
        "body": "This is an amazing photo! Where was it taken?",
        "like_count": 2,
        "reply_count": 1,
        "created_at": "2025-04-05T20:15:00Z",
        "user": {
          "id": 2,
          "username": "janedoe",
          "firstName": "Jane",
          "avatar": "https://example.com/avatars/janedoe.jpg",
          "verified": false
        },
        "liked_by_you": true
      }
    ]
  },
  "message": "Comments retrieved"
}
```

## Get Comment Replies
Get replies to a specific comment.

**URL:** `/comments/:commentId/replies`\
**Method:** `GET`\
**Auth required:** Optional (for private posts)

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "replies": [
      {
        "id": 124,
        "body": "It was taken at Sunset Beach in Hawaii!",
        "like_count": 1,
        "reply_count": 0,
        "created_at": "2025-04-05T20:30:00Z",
        "user": {
          "id": 1,
          "username": "johndoe",
          "firstName": "John",
          "avatar": "https://example.com/avatars/johndoe.jpg",
          "verified": true
        },
        "liked_by_you": false
      }
    ]
  },
  "message": "Replies retrieved"
}
```

## Update Comment
Update a comment.

**URL:** `/comments/:id`\
**Method:** `PUT`\
**Auth required:** Yes

### Request Body
```json
{
  "body": "Updated comment text"
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 123,
    "body": "Updated comment text",
    "updated_at": "2025-04-05T21:00:00Z"
  },
  "message": "Comment updated successfully"
}
```

## Delete Comment
Delete a comment.

**URL:** `/comments/:id`\
**Method:** `DELETE`\
**Auth required:** Yes

### Success Response (200 OK)
```json
{
  "success": true,
  "data": null,
  "message": "Comment deleted successfully"
}
```

## Like Comment
Like a comment.

**URL:** `/comments/:id/like`\
**Method:** `POST`\
**Auth required:** Yes

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "like_count": 3
  },
  "message": "Comment liked successfully"
}
```

## Unlike Comment
Remove like from a comment.

**URL:** `/comments/:id/unlike`\
**Method:** `DELETE`\
**Auth required:** Yes

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "like_count": 2
  },
  "message": "Comment unliked successfully"
}
```

---

# Follow Endpoints

## Follow User
Follow another user.

**URL:** `/users/:username/follow`\
**Method:** `POST`\
**Auth required:** Yes

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "status": "pending"
  },
  "message": "Follow request sent"
}
```

or if the user is not private:

```json
{
  "success": true,
  "data": {
    "status": "following"
  },
  "message": "User followed successfully"
}
```

## Unfollow User
Unfollow a user.

**URL:** `/users/:username/unfollow`\
**Method:** `DELETE`\
**Auth required:** Yes

### Success Response (200 OK)
```json
{
  "success": true,
  "data": null,
  "message": "User unfollowed successfully"
}
```

## Get User Followers
Get users who follow a specific user.

**URL:** `/users/:username/followers`\
**Method:** `GET`\
**Auth required:** Optional (for private profiles)

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "followers": [
      {
        "id": 3,
        "username": "mikebrown",
        "firstName": "Mike",
        "avatar": "https://example.com/avatars/mikebrown.jpg",
        "verified": false,
        "following_you": true
      }
    ]
  },
  "message": "Followers retrieved"
}
```

## Get User Following
Get users that a specific user is following.

**URL:** `/users/:username/following`\
**Method:** `GET`\
**Auth required:** Optional (for private profiles)

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "following": [
      {
        "id": 2,
        "username": "janedoe",
        "firstName": "Jane",
        "avatar": "https://example.com/avatars/janedoe.jpg",
        "verified": false,
        "following_you": false
      }
    ]
  },
  "message": "Following retrieved"
}
```

## Get Follow Requests
Get pending follow requests for the authenticated user.

**URL:** `/users/follow-requests`\
**Method:** `GET`\
**Auth required:** Yes

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "request_id": 3,
        "username": "mikebrown",
        "firstName": "Mike",
        "avatar": "https://example.com/avatars/mikebrown.jpg",
        "verified": false,
        "requested_at": "2025-04-04T15:30:00Z"
      }
    ]
  },
  "message": "Follow requests retrieved"
}
```

## Approve Follow Request
Approve a follow request.

**URL:** `/users/follow-requests/:id/approve`\
**Method:** `POST`\
**Auth required:** Yes

### Success Response (200 OK)
```json
{
  "success": true,
  "data": null,
  "message": "Follow request approved"
}
```

## Reject Follow Request
Reject a follow request.

**URL:** `/users/follow-requests/:id/reject`\
**Method:** `DELETE`\
**Auth required:** Yes

### Success Response (200 OK)
```json
{
  "success": true,
  "data": null,
  "message": "Follow request rejected"
}
```

---

# Hashtag Endpoints

## Get Trending Hashtags
Get trending hashtags.

**URL:** `/hashtags/trending`\
**Method:** `GET`\
**Auth required:** No

### Query Parameters
- `limit`: Number of hashtags (default: 10)

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "hashtags": [
      {
        "id": 15,
        "firstName": "sunset",
        "post_count": 1245
      },
      {
        "id": 8,
        "firstName": "photography",
        "post_count": 985
      },
      {
        "id": 23,
        "firstName": "travel",
        "post_count": 854
      }
    ]
  },
  "message": "Trending hashtags retrieved"
}
```

## Get Posts by Hashtag
Get posts with a specific hashtag.

**URL:** `/hashtags/:name/posts`\
**Method:** `GET`\
**Auth required:** Optional


### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "hashtag": {
      "id": 15,
      "firstName": "sunset",
      "post_count": 1245
    },
    "posts": [
      {
        "id": 55,
        "title": "Beautiful sunset",
        "body": "Captured this amazing sunset at the beach",
        "image": "https://example.com/posts/sunset123.jpg",
        "like_count": 12,
        "comment_count": 3,
        "created_at": "2025-04-05T19:45:00Z",
        "user": {
          "id": 1,
          "username": "johndoe",
          "firstName": "John",
          "avatar": "https://example.com/avatars/johndoe.jpg",
          "verified": true
        },
        "hashtags": ["sunset", "beach", "photography"]
      }
    ]
  },
  "message": "Hashtag posts retrieved"
}
```

---

# Notification Endpoints

## Get Notifications
Get notifications for the authenticated user.

**URL:** `/notifications`\
**Method:** `GET`\
**Auth required:** Yes

### Query Parameters
- `unread_only`: Filter unread notifications (default: false)

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 456,
        "type": "LIKE",
        "read": false,
        "created_at": "2025-04-05T19:55:00Z",
        "from_user": {
          "id": 2,
          "username": "janedoe",
          "firstName": "Jane",
          "avatar": "https://example.com/avatars/janedoe.jpg"
        },
        "post": {
          "id": 55,
          "title": "Beautiful sunset",
          "image": "https://example.com/posts/sunset123.jpg"
        },
        "comment": null
      },
      {
        "id": 455,
        "type": "FOLLOW",
        "read": true,
        "created_at": "2025-04-05T18:30:00Z",
        "from_user": {
          "id": 3,
          "username": "mikebrown",
          "firstName": "Mike",
          "avatar": "https://example.com/avatars/mikebrown.jpg"
        },
        "post": null,
        "comment": null
      }
    ],
    "unread_count": 8
  },
  "message": "Notifications retrieved"
}
```

## Mark Notification as Read
Mark a notification as read.

**URL:** `/notifications/:id/read`\
**Method:** `PUT`\
**Auth required:** Yes

### Success Response (200 OK)
```json
{
  "success": true,
  "data": null,
  "message": "Notification marked as read"
}
```

## Mark All Notifications as Read
Mark all notifications as read.

**URL:** `/notifications/read-all`\
**Method:** `PUT`\
**Auth required:** Yes

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "affected": 8
  },
  "message": "All notifications marked as read"
}
```

---

# Search Endpoints

## Search Users
Search for users.

**URL:** `/search/users`\
**Method:** `GET`\
**Auth required:** No

### Query Parameters
- `q`: Search query

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "username": "johndoe",
        "firstName": "John",
        "lastName": "Doe",
        "avatar": "https://example.com/avatars/johndoe.jpg",
        "verified": true,
        "following": false
      }
    ]
  },
  "message": "Search results retrieved"
}
```

## General Search
Perform a general search across users, posts, and hashtags.

**URL:** `/search`\
**Method:** `GET`\
**Auth required:** No

### Query Parameters
- `q`: Search query
- `type`: Filter by type (optional, values: "users", "posts", "hashtags")

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "username": "johndoe",
        "firstName": "John",
        "avatar": "https://example.com/avatars/johndoe.jpg",
        "verified": true
      }
    ],
    "posts": [
      {
        "id": 55,
        "title": "Beautiful sunset",
        "image": "https://example.com/posts/sunset123.jpg",
        "user": {
          "id": 1,
          "username": "johndoe",
          "firstName": "John"
        }
      }
    ],
    "hashtags": [
      {
        "id": 15,
        "firstName": "sunset",
        "post_count": 1245
      }
    ]
  },
  "message": "Search results retrieved"
}
```
