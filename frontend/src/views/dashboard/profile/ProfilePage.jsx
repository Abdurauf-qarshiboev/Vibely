/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useBlogsContext } from "@/context/main/BlogsContext";
import { useTheme } from "@/context/ThemeContext";
import {
  CameraIcon,
  PlusIcon,
  UserIcon,
  Cog8ToothIcon,
} from "@heroicons/react/24/outline";
import { PhotoIcon, BookmarkIcon, TagIcon } from "@heroicons/react/24/solid";
import VerifiedBadge from "../../../components/VerifiedBadge";

const ProfilePage = () => {
  const { user } = useAuth();
  const { blogs, allBlogs, loading } = useBlogsContext();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState("posts");
  const [userPosts, setUserPosts] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, you would fetch profile data from the backend
        // For now, we'll use the authenticated user data
        setProfileData({
          username: user?.username || "username",
          fullName: `${user?.firstName || "User"} ${user?.lastName || ""}`,
          avatar: user?.avatar || null,
          bio: user?.bio || "Personal blog",
          verified: user?.verified || false,
          postsCount: 0,
          followersCount: 135,
          followingCount: 642,
          pronouns: "they/them",
          links: [],
        });

        await allBlogs();
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchData();
  }, [user, allBlogs]);

  // Set user posts when blogs change
  useEffect(() => {
    if (blogs?.data && Array.isArray(blogs.data)) {
      // Filter posts by current user
      const filteredPosts = blogs.data.filter(
        (blog) => blog.user?.username === user?.username
      );
      setUserPosts(filteredPosts);

      // Update profile posts count
      if (profileData) {
        setProfileData((prev) => ({
          ...prev,
          postsCount: filteredPosts.length,
        }));
      }
    }
  }, [blogs, user]);

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
        <div className="flex flex-col sm:flex-row items-center sm:items-start">
          {/* Profile Image */}
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-4 sm:mb-0 sm:mr-8">
            {profileData.avatar ? (
              <img
                src={profileData.avatar}
                alt={profileData.username}
                className="w-full h-full rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div
                className={`w-full h-full rounded-full flex items-center justify-center ${
                  isDark ? "bg-gray-800" : "bg-gray-200"
                }`}
              >
                <UserIcon className="w-12 h-12 text-gray-500" />
              </div>
            )}

            {isOwnProfile && (
              <button className="absolute -bottom-2 right-0 rounded-full bg-blue-500 p-1">
                <PlusIcon className="w-5 h-5 text-white" />
              </button>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center sm:text-left">
            {/* Username and Edit Profile */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start mb-4">
              <div className="flex items-center mb-3 sm:mb-0">
                <h1 className="text-xl font-semibold">
                  {profileData.username}
                </h1>
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
              <div className="flex flex-col items-center sm:items-start sm:flex-row sm:space-x-1">
                <span className="font-semibold">{profileData.postsCount}</span>
                <span className="text-sm sm:text-base">posts</span>
              </div>

              <div className="flex flex-col items-center sm:items-start sm:flex-row sm:space-x-1">
                <span className="font-semibold">
                  {profileData.followersCount}
                </span>
                <span className="text-sm sm:text-base">followers</span>
              </div>

              <div className="flex flex-col items-center sm:items-start sm:flex-row sm:space-x-1">
                <span className="font-semibold">
                  {profileData.followingCount}
                </span>
                <span className="text-sm sm:text-base">following</span>
              </div>
            </div>

            {/* Bio */}
            <div className="text-left">
              <p className="font-semibold">{profileData.fullName}</p>
              {profileData.pronouns && (
                <p className="text-gray-500">{profileData.pronouns}</p>
              )}
              <p>{profileData.bio}</p>

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
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${
                isDark ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <PlusIcon className="w-8 h-8 text-gray-400" />
            </div>
            <span className="text-xs mt-1">New</span>
          </div>
          {/* Add more story highlights here */}
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
                  <div key={post.id} className="aspect-square">
                    <img
                      src={
                        post.image ||
                        "https://images.unsplash.com/photo-1682687982107-14492010e05e?auto=format&fit=crop&w=500&q=80"
                      }
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
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
                <button className="mt-4 text-blue-500 font-semibold">
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
    </div>
  );
};

export default ProfilePage;
