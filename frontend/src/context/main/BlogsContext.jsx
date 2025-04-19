import React, { createContext, useContext, useState, useCallback } from "react";
import { api } from "../../helpers/api";

const BlogsContext = createContext();

export const BlogsProvider = ({ children }) => {
  const [blogs, setBlogs] = useState({ data: [] });
  const [myblogs, setMyBlogs] = useState({ data: [] });
  const [loading, setLoading] = useState(false);

  // Fetch all blogs for the feed
  const allBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/posts/feed");
      console.log("all blogs:", response.data);

      if (response.data && response.data.success) {
        setBlogs(response.data);
        return response.data;
      } else {
        console.error(
          "Error fetching blogs: Invalid response structure",
          response
        );
        return { success: false, data: [] };
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      return { success: false, data: [] };
    } finally {
      setLoading(false);
    }
  }, []);
  const myBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/posts");
      console.log("My Posts:", response.data);

      if (response.data && response.data.success) {
        setMyBlogs(response.data);
        return response.data;
      } else {
        console.error(
          "Error fetching my posts: Invalid response structure",
          response
        );
        return { success: false, data: [] };
      }
    } catch (error) {
      console.error("Error fetching my Posts:", error);
      return { success: false, data: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get a blog by ID
  const getBlogById = (id) => {
    if (!blogs || !blogs.data) {
      return null;
    }
    return blogs.data.find((blog) => blog.id === parseInt(id)) || null;
  };

  // Calculate time since post
  const timeSince = (dateString) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";

    return Math.floor(seconds) + "s ago";
  };

  return (
    <BlogsContext.Provider
      value={{
        blogs,
        myblogs,
        loading,
        allBlogs,
        myBlogs,
        getBlogById,
        timeSince,
      }}
    >
      {children}
    </BlogsContext.Provider>
  );
};

export const useBlogsContext = () => {
  const context = useContext(BlogsContext);
  if (!context) {
    throw new Error("useBlogsContext must be used within a BlogsProvider");
  }
  return context;
};
