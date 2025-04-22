import React, { useState, useEffect } from "react";
import { Modal, Tag, Spin, Empty } from "antd";
import { UserIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { api } from "@/helpers/api";
import { getImageUrl } from "../../utils/ImageHelpers";
import { useNavigate } from "react-router-dom";
import VerifiedBadge from "../VerifiedBadge";
import { useTheme } from "@/context/ThemeContext";

const UserListModal = ({ isOpen, onClose, type, username }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageCache, setImageCache] = useState({});
  const [avatarUrls, setAvatarUrls] = useState({});
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Fetch users based on type (followers or following)
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isOpen || !username) return;

      setLoading(true);
      try {
        const endpoint =
          type === "followers"
            ? `/user/${username}/followers`
            : `/user/${username}/following`;

        const response = await api.get(endpoint);

        if (response.data && response.data.success) {
          const userData =
            type === "followers"
              ? response.data.data.followers
              : response.data.data.following;

          setUsers(userData || []);
          loadAvatars(userData);
        }
      } catch (error) {
        console.error(`Error fetching ${type}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, type, username]);

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
    navigate(`/profile/${username}`);
    onClose();
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
      className={isDark ? "dark-modal" : ""}
      closeIcon={<XMarkIcon className="h-6 w-6" />}
    >
      <div className={`max-h-96 p-5 overflow-y-auto ${isDark ? "text-white" : ""}`}>
        {loading ? (
          <div className="py-8 flex justify-center">
            <Spin size="large" />
          </div>
        ) : users.length > 0 ? (
          <div className="space-y-4 py-2">
            {users.map((user) => (
              <div
                key={user.id}
                className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer hover:${
                  isDark ? "bg-gray-800" : "bg-gray-100"
                }`}
                onClick={() => handleUserClick(user.username)}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {avatarUrls[user.username] ? (
                    <img
                      src={avatarUrls[user.username]}
                      alt={user.username}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/80x80/gray/white?text=User";
                      }}
                    />
                  ) : (
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isDark ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    >
                      <UserIcon className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <p
                      className={`font-medium truncate ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {user.firstName || user.username}
                    </p>
                    {user.verified && <VerifiedBadge className="ml-1" />}
                  </div>
                  <Tag color="blue">@{user.username}</Tag>
                </div>

                {/* Following indicator */}
                {user.following_you && (
                  <div className="text-xs text-gray-500">
                    <Tag color="green">Follows you</Tag>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Empty
            description={`No ${type} yet`}
            className={`py-8 ${isDark ? "text-white" : ""}`}
          />
        )}
      </div>
    </Modal>
  );
};

export default UserListModal;
