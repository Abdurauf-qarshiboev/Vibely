/* eslint-disable no-unused-vars */
import { api } from "./api";
import { message } from "antd";

// Helper functions for follow-related actions
export const followHelpers = {
  // Follow or request to follow a user
  followUser: async (username) => {
    try {
      const response = await api.post(`users/${username}/follow`);
      return {
        success: true,
        data: response.data?.data,
        isPending: response.data?.data?.status === "pending",
      };
    } catch (error) {
      console.error("Follow action failed:", error);

      // Handle "already following" case
      if (error.response?.data?.error?.code === "FOLLOW_002L") {
        return {
          success: true,
          alreadyFollowing: true,
        };
      }

      throw error;
    }
  },

  // Unfollow a user or cancel a follow request
  unfollowUser: async (username) => {
    try {
      await api.delete(`users/${username}/unfollow`);
      return { success: true };
    } catch (error) {
      console.error("Unfollow action failed:", error);
      throw error;
    }
  },

  // Get follow status by checking user profile
  getFollowStatus: async (username) => {
    try {
      const response = await api.get(`users/${username}`);
      const userData = response.data?.data;

      return {
        followedByYou: userData?.followedByYou || false,
        followingYou: userData?.followingYou || false,
        private: userData?.private || false,
      };
    } catch (error) {
      console.error("Error checking follow status:", error);
      throw error;
    }
  },

  // Approve a follow request
  approveRequest: async (requestId) => {
    try {
      await api.post(`users/follow-requests/${requestId}/approve`);
      return { success: true };
    } catch (error) {
      console.error("Error approving request:", error);
      throw error;
    }
  },

  // Reject a follow request
  rejectRequest: async (requestId) => {
    try {
      await api.delete(`users/follow-requests/${requestId}/reject`);
      return { success: true };
    } catch (error) {
      console.error("Error rejecting request:", error);
      throw error;
    }
  },
};

// Enum for follow status
export const FOLLOW_STATUS = {
  NONE: "none",
  FOLLOWING: "following",
  REQUESTED: "requested",
};

// Hook to manage debug mode
export const useDebugMode = () => {
  const isDebug = localStorage.getItem("debug_mode") === "true";

  const debugLog = (...args) => {
    if (isDebug) {
      console.log(...args);
    }
  };

  return { isDebug, debugLog };
};
