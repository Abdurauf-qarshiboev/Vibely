import React, { useState, useEffect } from "react";
import { Modal, Input, Button, Empty, Tag, message } from "antd";
import {
  UserIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";
import { api } from "@/helpers/api";
import { getImageUrl } from "@/utils/ImageHelpers";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext"; // Import auth context to get current user
import VerifiedBadge from "../VerifiedBadge";

const UserListModal = ({ isOpen, onClose, type, username }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [imageCache, setImageCache] = useState({});
  const [avatarUrls, setAvatarUrls] = useState({});
  const [followStatus, setFollowStatus] = useState({}); // Track follow status for each user
  const [processingUsers, setProcessingUsers] = useState({}); // Track which users have pending API calls
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user: currentUser } = useAuth(); // Get current user
  const isDark = theme === "dark";

  // Check if we're viewing current user's profile or someone else's
  const isOwnProfileList = currentUser && currentUser.username === username;

  // Fetch users based on type (followers or following)
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isOpen || !username) return;

      setLoading(true);
      try {
        const endpoint =
          type === "followers"
            ? `/users/${username}/followers`
            : `/users/${username}/following`;

        const response = await api.get(endpoint);

        if (response.data && response.data.success) {
          const userData =
            type === "followers"
              ? response.data.data.followers
              : response.data.data.following;

          // Initialize follow status for each user
          const initialStatus = {};
          userData.forEach((user) => {
            // For followers of current user, we can remove them
            // For following of current user, we can unfollow them
            // For other users' lists, we set status based on if we follow them
            if (isOwnProfileList) {
              initialStatus[user.username] =
                type === "followers" ? "remove" : "following";
            } else {
              // For other users' lists, check if we follow each user
              initialStatus[user.username] = user.following_you
                ? "following"
                : "follow";
            }
          });

          setFollowStatus(initialStatus);
          setUsers(userData || []);
          setFilteredUsers(userData || []);
          loadAvatars(userData);
        }
      } catch (error) {
        console.error(`Error fetching ${type}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    // Reset search when modal opens
    setSearchText("");
  }, [isOpen, type, username, isOwnProfileList]);

  // Filter users when search text changes
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchText.toLowerCase()) ||
        (user.firstName &&
          user.firstName.toLowerCase().includes(searchText.toLowerCase()))
    );

    setFilteredUsers(filtered);
  }, [searchText, users]);

  // Load avatars for all users
  const loadAvatars = async (userData) => {
    if (!userData || userData.length === 0) return;

    const newAvatarUrls = { ...avatarUrls };
    let hasChanges = false;

    for (const user of userData) {
      if (user.avatar && !avatarUrls[user.username]) {
        try {
          const url = await getImageUrl(user.avatar, imageCache, setImageCache);
          if (url) {
            newAvatarUrls[user.username] = url;
            hasChanges = true;
          }
        } catch (error) {
          console.error(`Error loading avatar for ${user.username}:`, error);
        }
      }
    }

    if (hasChanges) {
      setAvatarUrls(newAvatarUrls);
    }
  };

  // Navigate to user profile
  const handleUserClick = (username) => {
    navigate(`/user/${username}`);
    onClose();
  };

  // Handle follow/unfollow action
  const handleFollowAction = async (user, event) => {
    event.stopPropagation();

    // Don't do anything if it's the current user
    if (currentUser && user.username === currentUser.username) return;

    // Get current status to determine action
    const currentStatus = followStatus[user.username];
    const targetUsername = user.username;

    // If already processing, do nothing
    if (processingUsers[targetUsername]) return;

    // Set processing state
    setProcessingUsers((prev) => ({ ...prev, [targetUsername]: true }));

    try {
      if (currentStatus === "follow") {
        // Follow the user
        await api.post(`/users/${targetUsername}/follow`);

        // Check if the user is private
        if (user.private) {
          // Set status to "requested"
          setFollowStatus((prev) => ({
            ...prev,
            [targetUsername]: "requested",
          }));
          message.success(`Follow request sent to ${targetUsername}`);
        } else {
          // Set status to "following"
          setFollowStatus((prev) => ({
            ...prev,
            [targetUsername]: "following",
          }));
          message.success(`You are now following ${targetUsername}`);
        }
      } else if (
        currentStatus === "following" ||
        currentStatus === "requested"
      ) {
        // Unfollow the user
        await api.delete(`/users/${targetUsername}/unfollow`);
        setFollowStatus((prev) => ({ ...prev, [targetUsername]: "follow" }));
        message.success(`Unfollowed ${targetUsername}`);
      } else if (currentStatus === "remove" && isOwnProfileList) {
        // Only available if it's the current user's followers list
        // await api.delete(`/users/${targetUsername}/remove-follower`);

        // Remove the user from the list
        // setUsers((prev) => prev.filter((u) => u.username !== targetUsername));
        // setFilteredUsers((prev) =>
        //   prev.filter((u) => u.username !== targetUsername)
        // );

        message.warning(`Removing feature is coming soon...`);
      }
    } catch (error) {
      console.error(`Error during follow/unfollow action:`, error);
      message.error("Failed to update follow status");
    } finally {
      // Clear processing state
      setProcessingUsers((prev) => ({ ...prev, [targetUsername]: false }));
    }
  };

  // Check if a user is the current logged in user
  const isCurrentUser = (user) => {
    return currentUser && user.username === currentUser.username;
  };

  // Get button text based on status and context
  const getButtonText = (user, status) => {
    // If it's the current user, no button text needed
    if (isCurrentUser(user)) return null;

    switch (status) {
      case "follow":
        return "Follow";
      case "following":
        return "Following";
      case "requested":
        return "Requested";
      case "remove":
        return "Remove";
      default:
        return "Follow";
    }
  };

  // Get button style based on status
  const getButtonStyle = (status, isDark) => {
    const baseClasses = "rounded-md px-3 py-1 text-sm font-medium";

    switch (status) {
      case "follow":
        return `${baseClasses} ${
          isDark ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
        }`;
      case "following":
      case "requested":
      case "remove":
        return `${baseClasses} ${
          isDark ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"
        }`;
      default:
        return `${baseClasses} ${
          isDark ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
        }`;
    }
  };

  const title = type === "followers" ? "Followers" : "Following";

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      title={title}
      centered
      width={400}
      className={`user-list-modal ${isDark ? "dark-theme" : ""}`}
      closeIcon={<XMarkIcon className="h-5 w-5" />}
      styles={{
        header: {
          borderBottom: "1px solid #dbdbdb",
          padding: "12px 0",
          textAlign: "center",
        },
        body: {
          padding: "0",
        },
        content: {
          borderRadius: "12px",
          overflow: "hidden",
        },
      }}
    >
      {/* Search Bar */}
      <div
        className={`px-4 py-3 border-b ${
          isDark ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <Input
          placeholder="Search"
          prefix={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="rounded-md"
        />
      </div>

      {/* User List */}
      <div
        className={`h-96 overflow-y-auto ${isDark ? "bg-black" : "bg-white"}`}
      >
        {loading ? (
          <div className="py-8 flex justify-center items-center h-full">
            <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="py-2">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:${
                  isDark ? "bg-gray-900" : "bg-gray-50"
                }`}
                onClick={() => handleUserClick(user.username)}
              >
                {/* Left section - Avatar and name */}
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  {avatarUrls[user.username] ? (
                    <img
                      src={avatarUrls[user.username]}
                      alt={user.username}
                      className="w-11 h-11 rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/80x80/gray/white?text=User";
                      }}
                    />
                  ) : (
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center ${
                        isDark ? "bg-gray-800" : "bg-gray-200"
                      }`}
                    >
                      <UserIcon className="w-6 h-6 text-gray-500" />
                    </div>
                  )}

                  {/* Username and name */}
                  <div className="flex flex-col">
                    <div className="flex items-center mb-1">
                      <div
                        className={`text-sm font-semibold ${
                          isDark ? "text-white" : "text-gray-900"
                        } ${isCurrentUser(user) ? "font-bold" : ""}`}
                      >
                        {user.username}
                        {user.private && <span className="ml-1">🔒</span>}
                        {isCurrentUser(user) && (
                          <span className="ml-1 text-xs text-gray-500">
                            (you)
                          </span>
                        )}
                      </div>
                      {user.verified && <VerifiedBadge className="ml-1" />}
                    </div>
                    <Tag color="blue">@{user.username || ""}</Tag>
                  </div>
                </div>

                {/* Right section - Action button */}
                {/* Only show button if it's not the current user */}
                {!isCurrentUser(user) && (
                  <div>
                    <Button
                      onClick={(e) => handleFollowAction(user, e)}
                      size="small"
                      loading={processingUsers[user.username]}
                      className={getButtonStyle(
                        followStatus[user.username],
                        isDark
                      )}
                    >
                      {getButtonText(user, followStatus[user.username])}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Empty
            description={searchText ? "No users found" : `No ${type} yet`}
            className="py-8"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </div>
    </Modal>
  );
};

export default UserListModal;
