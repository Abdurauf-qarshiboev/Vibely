/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useModalContext } from "@/context/main/ModalContext";
import { useTheme } from "@/context/ThemeContext";
import BlogCommentsPage from "../blogs/BlogCommentsPage";
import { api } from "@/helpers/api";
import { getImageUrl } from "@/utils/ImageHelpers";
import {
  followHelpers,
  FOLLOW_STATUS,
  useDebugMode,
} from "@/helpers/followHelpers";
import {
  CameraIcon,
  UserIcon,
  ChevronLeftIcon,
  Cog6ToothIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { PhotoIcon, BookmarkIcon, TagIcon } from "@heroicons/react/24/solid";
import VerifiedBadge from "@/components/VerifiedBadge";
import { Tag, message } from "antd";
import UserListModal from "@/components/modals/UserListModal"; // Import UserListModal

const UserProfilePage = () => {
  const navigate = useNavigate();
  const { username } = useParams(); // Get username from URL params
  const { user: currentUser } = useAuth();
  const { setToggle } = useModalContext();
  const { theme } = useTheme();
  const { debugLog } = useDebugMode();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState("posts");
  const [userPosts, setUserPosts] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [followStatus, setFollowStatus] = useState(FOLLOW_STATUS.NONE);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [imageCache, setImageCache] = useState({});
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchAttempted = useRef(false);
  const postsAttemptedRef = useRef(false);

  // Add state for modals
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  // Check if this profile belongs to the current user
  const isOwnProfile = currentUser?.username === username;

  // Open comments for a specific post
  const openCommentsPage = (blogId, state) => {
    setToggle(blogId, state);
  };

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

  // Helper function for getting user's avatar
  const loadAvatar = async (avatarId) => {
    if (!avatarId) return;
    try {
      debugLog("Loading avatar with ID:", avatarId);
      const url = await getImageUrl(avatarId, imageCache, setImageCache);
      if (url) {
        setAvatarUrl(url);
        debugLog("Avatar URL loaded successfully");
      }
    } catch (error) {
      console.error("Error loading avatar:", error);
    }
  };

  // Check and update follow status
  const refreshFollowStatus = async () => {
    if (isOwnProfile || !username) return;

    try {
      const status = await followHelpers.getFollowStatus(username);
      debugLog("Follow status from API:", status);

      if (status.followedByYou) {
        setFollowStatus(FOLLOW_STATUS.FOLLOWING);
      } else {
        // Check sessionStorage for pending requests
        const pendingRequests = JSON.parse(
          sessionStorage.getItem("pendingRequests") || "[]"
        );
        const isPending = pendingRequests.includes(username);

        setFollowStatus(
          isPending ? FOLLOW_STATUS.REQUESTED : FOLLOW_STATUS.NONE
        );
      }
    } catch (error) {
      console.error("Error refreshing follow status:", error);
    }
  };

  // Handle follow action with improved error handling
  const handleFollowAction = async () => {
    if (!profileData || followLoading || isOwnProfile) return;

    setFollowLoading(true);

    try {
      if (followStatus === FOLLOW_STATUS.NONE) {
        // Follow or request to follow
        debugLog(`Attempting to follow ${username}`);
        const result = await followHelpers.followUser(username);

        if (result.alreadyFollowing) {
          setFollowStatus(FOLLOW_STATUS.FOLLOWING);
          message.info("You are already following this user");
          // Update profile data to reflect correct state
          setProfileData((prev) => ({
            ...prev,
            followedByYou: true,
          }));
        } else if (result.isPending) {
          setFollowStatus(FOLLOW_STATUS.REQUESTED);
          message.success("Follow request sent");

          // Save pending request in sessionStorage
          const pendingRequests = JSON.parse(
            sessionStorage.getItem("pendingRequests") || "[]"
          );
          if (!pendingRequests.includes(username)) {
            pendingRequests.push(username);
            sessionStorage.setItem(
              "pendingRequests",
              JSON.stringify(pendingRequests)
            );
          }
        } else {
          setFollowStatus(FOLLOW_STATUS.FOLLOWING);
          message.success(`You are now following ${username}`);

          // Update follower count
          setProfileData((prev) => ({
            ...prev,
            followersCount: prev.followersCount + 1,
          }));
        }
      } else {
        // Unfollow or cancel request
        debugLog(`Attempting to unfollow ${username}`);
        await followHelpers.unfollowUser(username);

        const wasRequested = followStatus === FOLLOW_STATUS.REQUESTED;
        setFollowStatus(FOLLOW_STATUS.NONE);

        // Remove from pending requests if needed
        if (wasRequested) {
          const pendingRequests = JSON.parse(
            sessionStorage.getItem("pendingRequests") || "[]"
          );
          const updatedRequests = pendingRequests.filter((u) => u !== username);
          sessionStorage.setItem(
            "pendingRequests",
            JSON.stringify(updatedRequests)
          );

          message.success("Follow request canceled");
        } else {
          message.success(`You've unfollowed ${username}`);

          // Update follower count
          setProfileData((prev) => ({
            ...prev,
            followersCount: Math.max(0, prev.followersCount - 1),
          }));
        }
      }
    } catch (error) {
      console.error("Follow action failed:", error);

      // Handle specific error cases
      if (error.response?.data?.error?.code === "FOLLOW_002L") {
        setFollowStatus(FOLLOW_STATUS.FOLLOWING);
        message.info("You are already following this user");
      } else {
        message.error(
          error.response?.data?.error?.message ||
            "Failed to update follow status"
        );
      }
    } finally {
      setFollowLoading(false);
    }
  };

  // Get follow button text based on status
  const getFollowButtonText = () => {
    if (followLoading) return "Loading...";

    switch (followStatus) {
      case FOLLOW_STATUS.FOLLOWING:
        return "Following";
      case FOLLOW_STATUS.REQUESTED:
        return "Requested";
      default:
        return profileData?.followingYou ? "Follow Back" : "Follow";
    }
  };

  // Handle back button click
  const handleBack = () => {
    navigate(-1);
  };

  // Fetch user profile data
  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const fetchUserProfile = async () => {
      if (!username || fetchAttempted.current) return;

      fetchAttempted.current = true;
      setLoading(true);
      setError(null);

      try {
        // Fetch user profile data
        debugLog(`Fetching profile for ${username}`);
        const userResponse = await api.get(`users/${username}`, {
          signal: controller.signal,
        });

        if (!isMounted) return;

        if (userResponse.data && userResponse.data.success) {
          const userData = userResponse.data.data;
          debugLog("User profile data:", userData);

          // Format user data
          setProfileData({
            username: userData.username,
            fullName:
              `${userData.firstName || ""} ${userData.lastName || ""}`.trim() ||
              userData.username,
            avatar: userData.avatar || null,
            bio: userData.bio || "",
            verified: userData.verified || false,
            postsCount: 0,
            followersCount: userData.followerCount || 0,
            followingCount: userData.followingCount || 0,
            email: userData.email || "",
            phone: userData.phone || "",
            joinDate: userData.created_at || "",
            private: userData.private || false,
            followingYou: userData.followingYou || false,
            followedByYou: userData.followedByYou || false,
          });

          // Load avatar if available
          if (userData.avatar) {
            await loadAvatar(userData.avatar);
          }

          // Set initial follow status
          if (!isOwnProfile) {
            if (userData.followedByYou) {
              setFollowStatus(FOLLOW_STATUS.FOLLOWING);
            } else {
              // Check sessionStorage for pending requests
              const pendingRequests = JSON.parse(
                sessionStorage.getItem("pendingRequests") || "[]"
              );
              setFollowStatus(
                pendingRequests.includes(username)
                  ? FOLLOW_STATUS.REQUESTED
                  : FOLLOW_STATUS.NONE
              );
            }
          }
        } else {
          setError("User not found");
        }
      } catch (error) {
        if (!isMounted) return;

        if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
          debugLog("Profile request was canceled during navigation");
        } else {
          console.error("Error fetching user profile:", error);
          setError("Failed to load user profile");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserProfile();

    // Reset the fetched flag when username changes
    return () => {
      isMounted = false;
      controller.abort();
      fetchAttempted.current = false;
      postsAttemptedRef.current = false;
    };
  }, [username, currentUser, isOwnProfile]);

  // Fetch user posts
  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    // Fetch user's posts
    const fetchUserPosts = async () => {
      // Avoid duplicate requests
      if (!username || postsAttemptedRef.current) return;

      // Don't fetch posts for private accounts if not following
      if (
        profileData?.private &&
        !profileData?.followedByYou &&
        !isOwnProfile
      ) {
        postsAttemptedRef.current = true;
        setLoading(false);
        return;
      }

      postsAttemptedRef.current = true;
      setLoading(true);

      try {
        debugLog("Fetching posts for user:", username);

        const postsResponse = await api.get(`/posts/user?user=${username}`, {
          signal: controller.signal,
        });

        if (!isMounted) return;

        if (postsResponse.data && postsResponse.data.success) {
          const posts = postsResponse.data.data || [];
          debugLog(`Found ${posts.length} posts for user ${username}`);

          // Process posts to include image URLs
          const processedPosts = [];

          for (const post of posts) {
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

              processedPosts.push({
                ...post,
                featuredImageUrl,
              });
            } catch (error) {
              if (!isMounted) break;

              console.error(`Error processing post ${post.id}:`, error);
              processedPosts.push({
                ...post,
                featuredImageUrl: null,
              });
            }
          }

          if (!isMounted) return;

          // Set posts and update count data
          setUserPosts(processedPosts);

          // Update post count in profile data
          setProfileData((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              postsCount: posts.length,
            };
          });

          debugLog("User posts loaded successfully:", processedPosts.length);
        }
      } catch (error) {
        if (!isMounted) return;

        // Only log non-aborted errors as real errors
        if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
          debugLog(
            "Posts request was canceled - this is normal during navigation"
          );
        } else {
          console.error("Error fetching user posts:", error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Execute the fetch if profile data is loaded
    if (profileData) {
      fetchUserPosts();
    }

    // Cleanup function
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [username, profileData, isOwnProfile]);

  // Show loading state
  if (loading && !profileData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div
        className={`w-full min-h-screen ${
          isDark ? "bg-black text-white" : "bg-white text-black"
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="flex items-center mb-6">
            <button
              onClick={handleBack}
              className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-bold">User Profile</h2>
          </div>
          <div className="py-12">
            <p className="text-red-500">{error}</p>
            <button
              onClick={handleBack}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Determine if we should show followers/following modals
  // (either not private, or following, or own profile)
  const canViewFollowers =
    !profileData?.private ||
    followStatus === FOLLOW_STATUS.FOLLOWING ||
    isOwnProfile;

  return (
    <div
      className={`w-full min-h-screen ${
        isDark ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      {/* Top Section with Profile Info */}
      <div className="relative top-5 left-5">
        <button
          onClick={handleBack}
          className="mr-4 p-2 rounded-full text-gray-500"
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="max-w-4xl mx-auto px-4 pt-6 sm:pt-8">
        {/* Back button for mobile */}
        <div className="md:hidden mb-4 flex items-center">
          <button
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold ml-2">
            {profileData?.username}
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-center">
          {/* Profile Image */}
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-4 sm:mb-0 sm:mr-8">
            {avatarUrl ? (
              <div className="w-full h-full rounded-full overflow-hidden border border-1 border-gray-300">
                <img
                  src={avatarUrl}
                  alt={profileData?.username}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/300x300/gray/white?text=User";
                  }}
                />
              </div>
            ) : (
              <div
                className={`w-full h-full rounded-full flex items-center justify-center ${
                  isDark ? "bg-gray-800" : "bg-gray-200"
                }`}
              >
                <UserIcon className="w-12 h-12 text-gray-500" />
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center sm:text-left">
            {/* Username and Follow Button */}
            <div className="flex flex-col sm:flex-row items-center sm:items-center mb-4">
              <div className="flex items-center mb-3 sm:mb-0">
                <div className="text-xl font-semibold">
                  {profileData?.username}
                </div>
                {profileData?.verified && <VerifiedBadge className="ml-1" />}
                {profileData?.private && (
                  <LockClosedIcon className="h-4 w-4 ml-2 text-gray-500" />
                )}
              </div>

              <div className="flex sm:ml-4">
                {!isOwnProfile ? (
                  <>
                    <button
                      onClick={handleFollowAction}
                      disabled={followLoading}
                      className={`px-4 py-1 rounded-lg font-medium ${
                        followStatus !== FOLLOW_STATUS.NONE
                          ? isDark
                            ? "bg-gray-800"
                            : "bg-gray-100"
                          : "bg-blue-500 text-white"
                      } ${
                        followLoading ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {getFollowButtonText()}
                    </button>
                    <button
                      className={`ml-2 px-4 py-1 rounded-lg font-medium ${
                        isDark ? "bg-gray-800" : "bg-gray-100"
                      }`}
                    >
                      Message
                    </button>
                  </>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate("/edit-profile")}
                      className={`px-4 py-1 text-sm font-semibold rounded ${
                        isDark
                          ? "bg-gray-800 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      Edit Profile
                    </button>

                    <button
                      className={`p-1 rounded ${
                        isDark
                          ? "bg-gray-800 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      <Cog6ToothIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Stats - Make clickable only if can view followers */}
            <div className="flex justify-center sm:justify-start space-x-5 sm:space-x-8 mb-4">
              <div className="flex flex-col items-center sm:items-center sm:flex-row sm:space-x-1">
                <span className="font-semibold">
                  {profileData?.postsCount || 0}
                </span>
                <span className="text-sm sm:text-base">posts</span>
              </div>

              <div
                className={`flex flex-col items-center sm:items-center sm:flex-row sm:space-x-1 ${
                  canViewFollowers ? "cursor-pointer hover:opacity-80" : ""
                }`}
                onClick={() => canViewFollowers && setShowFollowersModal(true)}
              >
                <span className="font-semibold">
                  {profileData?.followersCount || 0}
                </span>
                <span className="text-sm sm:text-base">followers</span>
              </div>

              <div
                className={`flex flex-col items-center sm:items-center sm:flex-row sm:space-x-1 ${
                  canViewFollowers ? "cursor-pointer hover:opacity-80" : ""
                }`}
                onClick={() => canViewFollowers && setShowFollowingModal(true)}
              >
                <span className="font-semibold">
                  {profileData?.followingCount || 0}
                </span>
                <span className="text-sm sm:text-base">following</span>
              </div>
            </div>

            {/* Bio */}
            <div className="text-left">
              <div className="flex items-center gap-2 mb-2">
                <div className="font-semibold text-sm">
                  {profileData?.fullName}
                </div>
              </div>
              <p className="text-sm">{profileData?.bio}</p>

              {/* Display username with @ , email and phone*/}
              <div className="flex items-center gap-2">
                <Tag color="geekblue">@{profileData?.username}</Tag>
                <Tag color="geekblue-inverse">{profileData?.email}</Tag>
                <Tag color="blue">{profileData?.phone}</Tag>
              </div>

              {/* Show join date */}
              <div className="text-gray-500 text-sm mt-1">
                Joined {formatJoinDate(profileData?.joinDate)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Private Account Notice */}
      {profileData?.private &&
        followStatus !== FOLLOW_STATUS.FOLLOWING &&
        !isOwnProfile && (
          <div className="mt-8 text-center">
            <div className={` ${isDark ? "bg-gray-900" : "bg-gray-300"} w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center`}>
              <LockClosedIcon className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-bold mb-2">This Account is Private</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Follow this account to see their photos and videos.
            </p>
          </div>
        )}

      {/* Only show tabs if account is not private or user is following or it's own profile */}
      {(!profileData?.private ||
        followStatus === FOLLOW_STATUS.FOLLOWING ||
        isOwnProfile) && (
        <>
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

              {/* Only show saved tab for own profile */}
              {isOwnProfile && (
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
              )}

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
            {/* POSTS TAB */}
            {activeTab === "posts" && (
              <div>
                {loading && !userPosts.length ? (
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

                        {/* Hover overlay with likes and comments count */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-8 text-white">
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
                              {post.likeCount || 0}
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
                              {post.commentCount || 0}
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
                    <h3 className="mt-4 text-2xl font-bold">No Posts Yet</h3>
                    <p className="mt-2 text-gray-500 max-w-md">
                      {isOwnProfile
                        ? "When you share photos, they will appear here."
                        : `When ${profileData?.username} shares photos, they will appear here.`}
                    </p>
                    {isOwnProfile && (
                      <button
                        onClick={() => navigate("/create-post")}
                        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      >
                        Create Your First Post
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SAVED TAB */}
            {activeTab === "saved" && (
              <>
                {isOwnProfile ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    {loading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    ) : (
                      <>
                        <p className="text-gray-500 mb-6">
                          Only you can see what you've saved
                        </p>
                        <div
                          className={`rounded-full p-6 ${
                            isDark ? "bg-gray-900" : "bg-gray-100"
                          }`}
                        >
                          <BookmarkIcon className="w-12 h-12 text-gray-500" />
                        </div>
                        <h3 className="mt-4 text-2xl font-bold">
                          No Saved Posts
                        </h3>
                        <p className="mt-2 text-gray-500 max-w-md">
                          Save photos and videos that you want to see again. No
                          one is notified, and only you can see what you've
                          saved.
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div
                      className={`rounded-full p-6 ${
                        isDark ? "bg-gray-900" : "bg-gray-100"
                      }`}
                    >
                      <BookmarkIcon className="w-12 h-12 text-gray-500" />
                    </div>
                    <h3 className="mt-4 text-2xl font-bold">
                      Private Collection
                    </h3>
                    <p className="mt-2 text-gray-500">
                      Saved posts can only be viewed by the account owner.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* TAGGED TAB */}
            {activeTab === "tagged" && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                {loading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                ) : (
                  <>
                    <div
                      className={`rounded-full p-6 ${
                        isDark ? "bg-gray-900" : "bg-gray-100"
                      }`}
                    >
                      <TagIcon className="w-12 h-12 text-gray-500" />
                    </div>
                    <h3 className="mt-4 text-2xl font-bold">
                      {isOwnProfile
                        ? "Photos of You"
                        : `Photos of ${profileData?.username}`}
                    </h3>
                    <p className="mt-2 text-gray-500 max-w-md">
                      {isOwnProfile
                        ? "When people tag you in photos, they'll appear here."
                        : `When people tag ${profileData?.username} in photos, they'll appear here.`}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* BlogCommentsPage component for post comments */}
      <BlogCommentsPage />

      {/* Follower and Following Modals */}
      {profileData && canViewFollowers && (
        <>
          <UserListModal
            isOpen={showFollowersModal}
            onClose={() => setShowFollowersModal(false)}
            type="followers"
            username={profileData.username}
          />

          <UserListModal
            isOpen={showFollowingModal}
            onClose={() => setShowFollowingModal(false)}
            type="following"
            username={profileData.username}
          />
        </>
      )}
    </div>
  );
};

export default UserProfilePage;
