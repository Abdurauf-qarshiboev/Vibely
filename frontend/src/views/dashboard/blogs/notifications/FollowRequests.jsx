import React, { useState, useEffect, useRef } from "react";
import { api } from "@/helpers/api";
import { getImageUrl } from "../../../../utils/ImageHelpers";
import { UserIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { message } from "antd";
import { format } from "date-fns";
import { useTheme } from "@/context/ThemeContext";
import { Link } from "react-router-dom";

const FollowRequests = ({ requests, onRequestHandled = () => {} }) => {
  const [processingIds, setProcessingIds] = useState({});
  const [avatarUrls, setAvatarUrls] = useState({});
  const [imageCache, setImageCache] = useState({});
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isMounted = useRef(true);

  // Load avatars when requests change
  useEffect(() => {
    isMounted.current = true;

    const loadAvatars = async () => {
      const newAvatarUrls = { ...avatarUrls };

      for (const request of requests) {
        if (request.avatar && !avatarUrls[request.request_id]) {
          try {
            const url = await getImageUrl(
              request.avatar,
              imageCache,
              setImageCache
            );
            if (url && isMounted.current) {
              newAvatarUrls[request.request_id] = url;
            }
          } catch (error) {
            console.error(
              `Error loading avatar for request ${request.request_id}:`,
              error
            );
          }
        }
      }

      if (isMounted.current) {
        setAvatarUrls(newAvatarUrls);
      }
    };

    loadAvatars();

    return () => {
      isMounted.current = false;
    };
  }, [requests]);

  // Format "requested_at" date
  const formatRequestDate = (dateString) => {
    try {
      if (!dateString) return "";
      return format(new Date(dateString), "MMM d, yyyy • h:mm a");
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString;
    }
  };

  // Handle approve request
  const handleApproveRequest = async (requestId) => {
    if (processingIds[requestId]) return;

    setProcessingIds((prev) => ({ ...prev, [requestId]: true }));

    try {
      await api.post(`users/follow-requests/${requestId}/approve`);
      message.success("Follow request approved");
      onRequestHandled(requestId, "approved");
    } catch (error) {
      console.error("Error approving request:", error);
      message.error("Failed to approve request");
    } finally {
      setProcessingIds((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  // Handle reject request
  const handleRejectRequest = async (requestId) => {
    if (processingIds[requestId]) return;

    setProcessingIds((prev) => ({ ...prev, [requestId]: true }));

    try {
      await api.delete(`users/follow-requests/${requestId}/reject`);
      message.success("Follow request rejected");
      onRequestHandled(requestId, "rejected");
    } catch (error) {
      console.error("Error rejecting request:", error);
      message.error("Failed to reject request");
    } finally {
      setProcessingIds((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  if (!requests || requests.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3
        className={`text-lg font-bold mb-3 ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        Follow Requests
      </h3>

      <div
        className={`rounded-lg ${
          isDark ? "bg-gray-800" : "bg-white"
        } overflow-hidden shadow`}
      >
        {requests.map((request) => (
          <div
            key={request.request_id}
            className={`p-4 flex items-center justify-between ${
              isDark ? "border-gray-700" : "border-gray-100"
            } border-b last:border-b-0`}
          >
            <div className="flex items-center">
              {/* User Avatar */}
              <Link
                to={`/profile/${request.username}`}
                className="relative flex-shrink-0"
              >
                {avatarUrls[request.request_id] ? (
                  <img
                    src={avatarUrls[request.request_id]}
                    alt={`${request.username}'s avatar`}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/150";
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

                {request.verified && (
                  <span className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-0.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </Link>

              {/* User Info */}
              <div className="ml-3">
                <Link
                  to={`/user/${request.username}`}
                  className="font-medium hover:underline"
                >
                  {request.username}
                </Link>
                <div className="text-sm text-gray-500">{request.firstName}</div>
                <div className="text-xs text-gray-400">
                  {formatRequestDate(request.requested_at)}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => handleRejectRequest(request.request_id)}
                disabled={processingIds[request.request_id]}
                className={`p-2 rounded-full ${
                  isDark
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>

              <button
                onClick={() => handleApproveRequest(request.request_id)}
                disabled={processingIds[request.request_id]}
                className="p-2 rounded-full bg-blue-500 hover:bg-blue-600"
              >
                <CheckIcon className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowRequests;
