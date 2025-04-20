/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useBlogsContext } from "@/context/main/BlogsContext";
import { useCommentsContext } from "../../../context/main/CommentsContext";
import { useHashtagsContext } from "../../../context/main/HashtagsContext";
import { useModalContext } from "../../../context/main/ModalContext";
import { useTheme } from "@/context/ThemeContext";
import { api } from "@/helpers/api";
import { getImageUrl } from "../../../utils/ImageHelpers";
import BlogCommentsPage from "../../../views/dashboard/blogs/BlogCommentsPage"; // Import the comments page component
import {
  CameraIcon,
  PlusIcon,
  UserIcon,
  Cog8ToothIcon,
  XMarkIcon, // Added for close button
} from "@heroicons/react/24/outline";
import { PhotoIcon, BookmarkIcon, TagIcon } from "@heroicons/react/24/solid";
import VerifiedBadge from "../../../components/VerifiedBadge";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { myblogs, myBlogs, loading } = useBlogsContext();
  const { setToggle } = useModalContext();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState("posts");
  const [userPosts, setUserPosts] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [imageCache, setImageCache] = useState({});
  const { getCommentDraft, updateCommentDraft, submitComment } =
      useCommentsContext();
    const { processedText, handleHashtagClick } = useHashtagsContext();
  const myBlogsFetched = useRef(false);

  // States for handling post comments view
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [selectedPostData, setSelectedPostData] = useState(null);
  const [loadingPostData, setLoadingPostData] = useState(false);

  // Navigate to post creation page
  const handleCreatePost = () => {
    navigate("/create");
  };

  // Open comments for a specific post
  const openCommentsPage = (blogId, state) => {
    setToggle(blogId, state);
    console.log("Comments page is " + state + " for a blog with id:" + blogId);
  };

  // Helper function for getting current user's avatar
  const loadAvatar = async (avatarId) => {
    if (!avatarId) return;
    try {
      const url = await getImageUrl(avatarId, imageCache, setImageCache);
      if (url) {
        setAvatarUrl(url);
      }
    } catch (error) {
      console.error("Error loading avatar:", error);
    }
  };

  // Initial profile data fetch - once only
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Format join date safely
        let formattedJoinDate = "2025-04-19";
        if (user?.created_at) {
          formattedJoinDate = user.created_at;
        }

        // Set initial profile data
        setProfileData({
          username: user?.username || "User",
          fullName: `${user?.firstName || "User"} ${user?.lastName || "User"}`,
          avatar: user?.avatar || null,
          bio: user?.bio || "Personal blog",
          verified: user?.verified || false,
          postsCount: 0,
          followersCount: user?.followersCount || 0,
          followingCount: user?.followingCount || 0,
          pronouns: "he/him",
          links: [],
          email: user?.email || "",
          joinDate: formattedJoinDate,
        });

        // If user has an avatar, load it
        if (user?.avatar) {
          await loadAvatar(user.avatar);
        }
      } catch (error) {
        console.error("Error setting profile data:", error);
      }
    };

    fetchProfileData();
  }, [user]);

  // Fetch my blogs once
  useEffect(() => {
    const fetchMyBlogs = async () => {
      if (!myBlogsFetched.current) {
        myBlogsFetched.current = true;
        try {
          await myBlogs();
        } catch (error) {
          console.error("Error fetching my blogs:", error);
          // Reset the flag after a delay to allow retry
          setTimeout(() => {
            myBlogsFetched.current = false;
          }, 5000);
        }
      }
    };

    fetchMyBlogs();
  }, [myBlogs]);

  // Process posts when myblogs changes - with error handling
  useEffect(() => {
    const processUserPosts = async () => {
      if (myblogs?.data && Array.isArray(myblogs.data)) {
        try {
          // No need to filter - myblogs should already be user's posts
          const processedPosts = await Promise.all(
            myblogs.data.map(async (post) => {
              try {
                // Get first image as featured image
                let featuredImageUrl = null;
                if (post.images && post.images.length > 0) {
                  featuredImageUrl = await getImageUrl(
                    post.images[0],
                    imageCache,
                    setImageCache
                  );
                }

                return {
                  ...post,
                  featuredImageUrl,
                };
              } catch (error) {
                console.error(`Error processing post ${post.id}:`, error);
                return {
                  ...post,
                  featuredImageUrl: null,
                };
              }
            })
          );

          setUserPosts(processedPosts);
        } catch (error) {
          console.error("Error processing user posts:", error);
        }
      }
    };

    processUserPosts();
  }, [myblogs]);

  // Update posts count separately to avoid infinite updating
  useEffect(() => {
    if (profileData && profileData.postsCount !== userPosts.length) {
      setProfileData((prev) => ({
        ...prev,
        postsCount: userPosts.length,
      }));
    }
  }, [userPosts.length]);

  // Format date function with error handling
  const formatJoinDate = (dateStr) => {
    try {
      if (!dateStr) return "N/A";
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  if (!profileData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div
      className={`w-full min-h-screen ${
        isDark ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      {/* Top Section with Profile Info */}
      <div className="max-w-4xl mx-auto px-4 pt-6 sm:pt-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-center">
          {/* Profile Image */}
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-4 sm:mb-0 sm:mr-8">
            {avatarUrl ? (
              <div className="w-full h-full rounded-full overflow-hidden border border-1 border-gray-300">
                <img
                  src={avatarUrl}
                  alt={profileData.username}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/300x300/gray/white?text=User";
                  }}
                />
              </div>
            ) : (
              <button
                className={`w-full h-full rounded-full flex items-center justify-center ${
                  isDark ? "bg-gray-800" : "bg-gray-200"
                }`}
              >
                <UserIcon className="w-12 h-12 text-gray-500" />
              </button>
            )}

            {isOwnProfile && (
              <button className="absolute bottom-1 right-1 rounded-full bg-blue-500 p-1">
                <PlusIcon className="w-5 h-5 text-white" />
              </button>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center sm:text-left">
            {/* Username and Edit Profile */}
            <div className="flex flex-col sm:flex-row items-center  sm:items-center mb-4">
              <div className="flex items-center mb-3 sm:mb-0">
                <div className="text-xl font-semibold">
                  {profileData.username}
                </div>
                {profileData.verified && <VerifiedBadge className="ml-1" />}
              </div>

              <div className="flex sm:ml-4">
                {isOwnProfile ? (
                  <button
                    className={`px-4 py-1 rounded-lg font-medium ${
                      isDark ? "bg-gray-800" : "bg-gray-100"
                    }`}
                  >
                    Edit profile
                  </button>
                ) : (
                  <>
                    <button className="px-4 py-1 rounded-lg bg-blue-500 text-white font-medium mr-2">
                      Follow
                    </button>
                    <button
                      className={`px-4 py-1 rounded-lg font-medium ${
                        isDark ? "bg-gray-800" : "bg-gray-100"
                      }`}
                    >
                      Message
                    </button>
                  </>
                )}

                <button
                  className={`ml-2 p-2 rounded-lg ${
                    isDark ? "bg-gray-800" : "bg-gray-100"
                  }`}
                >
                  <Cog8ToothIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center sm:justify-start space-x-5 sm:space-x-8 mb-4">
              <div className="flex flex-col items-center sm:items-center sm:flex-row sm:space-x-1">
                <span className="font-semibold">{profileData.postsCount}</span>
                <span className="text-sm sm:text-base">posts</span>
              </div>

              <div className="flex flex-col items-center sm:items-center sm:flex-row sm:space-x-1">
                <span className="font-semibold">
                  {profileData.followersCount}
                </span>
                <span className="text-sm sm:text-base">followers</span>
              </div>

              <div className="flex flex-col items-center sm:items-center sm:flex-row sm:space-x-1">
                <span className="font-semibold">
                  {profileData.followingCount}
                </span>
                <span className="text-sm sm:text-base">following</span>
              </div>
            </div>

            {/* Bio */}
            <div className="text-left">
              <div className="flex items-center gap-2 mb-2">
                <div className="font-semibold text-sm">
                  {profileData.fullName}
                </div>
                {profileData.pronouns && (
                  <div className="text-gray-500">{profileData.pronouns}</div>
                )}
              </div>
              <p className="text-sm">{profileData.bio}</p>

              {/* Display username with @ */}
              <div className="text-gray-500">@{profileData.username}</div>

              {/* Show join date */}
              <div className="text-gray-500 text-sm">
                Joined {formatJoinDate(profileData.joinDate)}
              </div>

              {profileData.links && profileData.links.length > 0 && (
                <div className="mt-1">
                  {profileData.links.map((link, index) => (
                    <p key={index} className="text-blue-900 dark:text-blue-400">
                      {link}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Story Highlights */}
        <div className="mt-6 flex space-x-4 overflow-x-auto pb-2">
          <div className="flex flex-col items-center">
            <button
              className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${
                isDark ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <PlusIcon className="w-8 h-8 text-gray-400" />
            </button>
            <span className="text-xs mt-1">New</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        className={`mt-6 border-t ${
          isDark ? "border-gray-800" : "border-gray-300"
        }`}
      >
        <div className="flex justify-around max-w-4xl mx-auto">
          <button
            onClick={() => setActiveTab("posts")}
            className={`py-3 flex-1 flex justify-center items-center gap-1 ${
              activeTab === "posts"
                ? isDark
                  ? "border-b border-white"
                  : "border-b border-black"
                : ""
            }`}
          >
            <PhotoIcon
              className={`w-5 h-5 ${
                activeTab === "posts" ? "" : "text-gray-500"
              }`}
            />
            <span className="uppercase text-xs tracking-wider font-medium">
              Posts
            </span>
          </button>

          <button
            onClick={() => setActiveTab("saved")}
            className={`py-3 flex-1 flex justify-center items-center gap-1 ${
              activeTab === "saved"
                ? isDark
                  ? "border-b border-white"
                  : "border-b border-black"
                : ""
            }`}
          >
            <BookmarkIcon
              className={`w-5 h-5 ${
                activeTab === "saved" ? "" : "text-gray-500"
              }`}
            />
            <span className="uppercase text-xs tracking-wider font-medium">
              Saved
            </span>
          </button>

          <button
            onClick={() => setActiveTab("tagged")}
            className={`py-3 flex-1 flex justify-center items-center gap-1 ${
              activeTab === "tagged"
                ? isDark
                  ? "border-b border-white"
                  : "border-b border-black"
                : ""
            }`}
          >
            <TagIcon
              className={`w-5 h-5 ${
                activeTab === "tagged" ? "" : "text-gray-500"
              }`}
            />
            <span className="uppercase text-xs tracking-wider font-medium">
              Tagged
            </span>
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      <div className="max-w-4xl mx-auto px-4 pb-20">
        {activeTab === "posts" && (
          <>
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : userPosts.length > 0 ? (
              <div className="grid grid-cols-3 gap-1 mt-1">
                {userPosts.map((post) => (
                  <div
                    key={post.id}
                    className="aspect-square relative cursor-pointer group"
                    onClick={() => openCommentsPage(post.id, true)}
                  >
                    {/* Post image */}
                    <img
                      src={
                        post.featuredImageUrl ||
                        "https://placehold.co/300x300/gray/white?text=No+Image"
                      }
                      alt={post.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/300x300/gray/white?text=Error";
                      }}
                    />

                    {/* Hover overlay with likes and comments count - Instagram style */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-8 text-white">
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-7 h-7 mr-2"
                        >
                          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                        </svg>
                        <span className="text-xl font-medium">
                          {post.likeCount}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-7 h-7 mr-2"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.337 21.718a6.707 6.707 0 01-.533-.074.75.75 0 01-.44-1.223 3.73 3.73 0 00.814-1.686c.023-.115-.022-.317-.254-.543C3.274 16.587 2.25 14.41 2.25 12c0-5.03 4.428-9 9.75-9s9.75 3.97 9.75 9c0 5.03-4.428 9-9.75 9-.833 0-1.643-.097-2.417-.279a6.721 6.721 0 01-4.246.997z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-xl font-medium">
                          {post.commentCount}
                        </span>
                      </div>
                    </div>

                    {/* Indicator for multiple images */}
                    {post.images && post.images.length > 1 && (
                      <div className="absolute top-2 right-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="white"
                          className="w-5 h-5"
                        >
                          <path
                            fillRule="evenodd"
                            d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div
                  className={`rounded-full p-6 ${
                    isDark ? "bg-gray-900" : "bg-gray-100"
                  }`}
                >
                  <CameraIcon className="w-12 h-12 text-gray-500" />
                </div>
                <h3 className="mt-4 text-2xl font-bold">Share Photos</h3>
                <p className="mt-2 text-gray-500">
                  When you share photos, they will appear on your profile.
                </p>
                <button
                  onClick={handleCreatePost}
                  className="mt-4 text-blue-500 font-semibold"
                >
                  Share your first photo
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === "saved" && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-500">Only you can see what you've saved</p>
            {userPosts.length === 0 && (
              <>
                <div
                  className={`mt-6 rounded-full p-6 ${
                    isDark ? "bg-gray-900" : "bg-gray-100"
                  }`}
                >
                  <BookmarkIcon className="w-12 h-12 text-gray-500" />
                </div>
                <h3 className="mt-4 text-2xl font-bold">Save</h3>
                <p className="mt-2 text-gray-500">
                  Save photos and videos that you want to see again.
                </p>
              </>
            )}
          </div>
        )}

        {activeTab === "tagged" && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div
              className={`rounded-full p-6 ${
                isDark ? "bg-gray-900" : "bg-gray-100"
              }`}
            >
              <TagIcon className="w-12 h-12 text-gray-500" />
            </div>
            <h3 className="mt-4 text-2xl font-bold">Photos of you</h3>
            <p className="mt-2 text-gray-500">
              When people tag you in photos, they'll appear here.
            </p>
          </div>
        )}
      </div>
      <BlogCommentsPage />
    </div>
  );
};

export default ProfilePage;
