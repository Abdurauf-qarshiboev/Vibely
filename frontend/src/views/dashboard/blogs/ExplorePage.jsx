import React, { useState, useEffect } from "react";
import { api } from "@/helpers/api";
import { getImageUrl } from "@/utils/ImageHelpers";
import { useTheme } from "@/context/ThemeContext";
import { useModalContext } from "@/context/main/ModalContext";
import BlogCommentsPage from "../blogs/BlogCommentsPage";
import { HeartIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/solid";
import { Spin, Empty } from "antd";
import VerifiedBadge from "@/components/VerifiedBadge";

const ExplorePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageCache, setImageCache] = useState({});
  const { theme } = useTheme();
  const { setToggle } = useModalContext();
  const isDark = theme === "dark";

  // Open comments for a post
  const openCommentsPage = (postId) => {
    setToggle(postId, true);
  };

  // Get post images
  const getPostImage = async (imageId) => {
    if (!imageId) return null;
    try {
      return await getImageUrl(imageId, imageCache, setImageCache);
    } catch (error) {
      console.error(`Error fetching image ${imageId}:`, error);
      return null;
    }
  };

  // Fetch explore posts
  useEffect(() => {
    const fetchExplorePosts = async () => {
      setLoading(true);
      try {
        const response = await api.get("posts/explore");
        if (response.data && response.data.success) {
          const postsData = response.data.data || [];

          // Process each post to include the first image URL
          const processedPosts = await Promise.all(
            postsData.map(async (post) => {
              // Get first image as featured image
              let featuredImageUrl = null;
              if (post.images && post.images.length > 0) {
                featuredImageUrl = await getPostImage(post.images[0]);
              }

              return {
                ...post,
                featuredImageUrl,
              };
            })
          );

          setPosts(processedPosts);
        }
      } catch (error) {
        console.error("Error fetching explore posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExplorePosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="py-20">
        <Empty description="No posts to explore yet" />
      </div>
    );
  }

  return (
    <div
      className={`w-full py-4 ${
        isDark ? "bg-black text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Header */}
      <div
        className={`max-w-7xl mx-auto px-4 mb-4 sticky top-0 z-10 py-3 ${
          isDark ? "bg-black/90" : "bg-white/90"
        } backdrop-blur-md border-b ${
          isDark ? "border-gray-800" : "border-gray-200"
        }`}
      >
        <h1 className="text-2xl font-bold">Explore</h1>
      </div>

      {/* Posts Grid */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-3 gap-1 md:gap-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="aspect-square relative cursor-pointer group"
              onClick={() => openCommentsPage(post.id)}
            >
              {/* Post image */}
              <img
                src={
                  post.featuredImageUrl ||
                  "https://placehold.co/600x600/gray/white?text=No+Image"
                }
                alt={post.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://placehold.co/600x600/gray/white?text=Error";
                }}
              />

              {/* Overlay with user info and stats */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3">
                {/* User info at top */}
                <div className="flex items-center">
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-200 mr-2">
                    {post.user && post.user.avatar && (
                      <img
                        src={`/api/images/${post.user.avatar}`}
                        alt={post.user.username}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://placehold.co/100x100/gray/white?text=User";
                        }}
                      />
                    )}
                  </div>
                  <div className="text-white text-sm font-medium flex items-center">
                    {post.user.username}
                    {post.user.verified && (
                      <VerifiedBadge className="ml-1" size="sm" />
                    )}
                  </div>
                </div>

                {/* Stats at bottom */}
                <div className="flex items-center text-white space-x-4">
                  <div className="flex items-center">
                    <HeartIcon className="w-5 h-5 mr-1" />
                    <span>{post.likeCount}</span>
                  </div>
                  <div className="flex items-center">
                    <ChatBubbleLeftIcon className="w-5 h-5 mr-1" />
                    <span>{post.commentCount}</span>
                  </div>
                </div>
              </div>

              {/* Multi-image indicator */}
              {post.images && post.images.length > 1 && (
                <div className="absolute top-2 right-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="white"
                    className="w-5 h-5 drop-shadow-md"
                  >
                    <path
                      fillRule="evenodd"
                      d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}

              {/* Private post indicator */}
              {post.user.private && (
                <div className="absolute top-2 left-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="white"
                    className="w-5 h-5 drop-shadow-md"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* BlogCommentsPage for viewing post details */}
      <BlogCommentsPage />
    </div>
  );
};

export default ExplorePage;
