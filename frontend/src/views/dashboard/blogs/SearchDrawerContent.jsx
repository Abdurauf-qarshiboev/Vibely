import React, { useState, useEffect, useRef } from "react";
import { Input, Tabs, Empty, Spin, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useTheme } from "@/context/ThemeContext";
import { api } from "../../../helpers/api";
import { useModalContext } from "@/context/main/ModalContext";
import { getImageUrl } from "../../../utils/ImageHelpers";
import { useNavigate } from "react-router-dom";

const { TabPane } = Tabs;

const SearchDrawerContent = ({ onClose }) => {
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("Users");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [users, setUsers] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [posts, setPosts] = useState([]);
  const [imageCache, setImageCache] = useState({});
  const [avatarUrls, setAvatarUrls] = useState({});
  const [postImageUrls, setPostImageUrls] = useState({});
  const searchTimerRef = useRef(null);

  // Use the theme and modal context
  const { theme } = useTheme();
  const { setToggle } = useModalContext();
  const isDark = theme === "dark";
  const navigate = useNavigate();

  // Force re-render when theme changes
  const [, forceUpdate] = useState({});
  useEffect(() => {
    forceUpdate({});

    // Apply theme to document element to ensure proper CSS inheritance
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Open post comments and close drawer
  const openPostComments = (postId) => {
    // Close drawer first
    if (onClose) onClose();

    // Then open comments with slight delay to allow drawer to close
    setTimeout(() => {
      setToggle(postId, true);
    }, 100);
  };

  // Handle navigation to user profile
  const navigateToUserProfile = (username) => {
    // Close drawer first
    if (onClose) onClose();

    // Then navigate with slight delay
    setTimeout(() => {
      navigate(`/profile/${username}`);
    }, 100);
  };

  // Handle navigation to hashtag page
  const navigateToHashtag = (hashtag) => {
    // Close drawer first
    if (onClose) onClose();

    // Then navigate with slight delay
    setTimeout(() => {
      navigate(`/explore/tags/${hashtag}`);
    }, 100);
  };

  // Load avatar for a user
  const loadAvatar = async (user) => {
    if (!user || !user.avatar || avatarUrls[user.username]) return;

    try {
      const url = await getImageUrl(user.avatar, imageCache, setImageCache);
      if (url) {
        setAvatarUrls((prev) => ({
          ...prev,
          [user.username]: url,
        }));
      }
    } catch (error) {
      console.error(`Error loading avatar for ${user.username}:`, error);
    }
  };

  // Load image for a post
  const loadPostImage = async (post) => {
    if (
      !post ||
      !post.images ||
      post.images.length === 0 ||
      postImageUrls[post.id]
    )
      return;

    try {
      const url = await getImageUrl(post.images[0], imageCache, setImageCache);
      if (url) {
        setPostImageUrls((prev) => ({
          ...prev,
          [post.id]: url,
        }));
      }
    } catch (error) {
      console.error(`Error loading image for post ${post.id}:`, error);
    }
  };

  // Fetch initial data (hashtags and suggested users)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch hashtags
        const hashtagsResponse = await api.get("/hashtags/trending");
        if (hashtagsResponse.data?.success) {
          setHashtags(hashtagsResponse.data.data || []);
        }

        // For users
        const usersResponse = await api.get("/users/suggested");
        if (usersResponse.data?.success) {
          const suggestedUsers = usersResponse.data.data || [];
          setUsers(suggestedUsers);

          // Load avatars for suggested users
          for (const user of suggestedUsers) {
            await loadAvatar(user);
          }
        }
      } catch (error) {
        console.error("Error fetching search data:", error);
        // Use some sample data if API fails
        setHashtags([
          {
            id: 1,
            name: "news",
            postCount: 3,
            createdAt: "2025-04-17T11:43:38.959644",
          },
          {
            id: 2,
            name: "morning",
            postCount: 3,
            createdAt: "2025-04-17T11:43:39.044774",
          },
          {
            id: 3,
            name: "technology",
            postCount: 2,
            createdAt: "2025-04-17T11:43:39.077091",
          },
          {
            id: 4,
            name: "elon",
            postCount: 2,
            createdAt: "2025-04-17T11:43:39.107988",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Search function with API calls
  const performSearch = async (searchValue) => {
    // Use the passed searchValue parameter to ensure we have the latest value
    const query = searchValue.trim();

    if (!query || query.length === 0) {
      // When no search text, show default results
      setSearchResults(
        activeTab === "Users"
          ? users
          : activeTab === "Hashtags"
          ? hashtags
          : posts
      );
      return;
    }

    setSearching(true);
    try {
      if (activeTab === "Users") {
        // API call to search for a specific user
        try {
          console.log(`Searching for user: "${query}"`); // Debug log
          const response = await api.get(`/users/${query}`);
          if (response.data && response.data.success) {
            const user = response.data.data;
            setSearchResults([user]);

            // Load avatar for the found user
            await loadAvatar(user);
          } else {
            setSearchResults([]);
          }
        } catch (error) {
          console.error("User search error:", error);
          setSearchResults([]);
          if (error.response && error.response.status !== 404) {
            message.error("Error searching for users");
          }
        }
      } else if (activeTab === "Hashtags") {
        // Filter hashtags locally
        const searchQuery = query.startsWith("#") ? query.substring(1) : query;
        const filteredHashtags = hashtags.filter((hashtag) =>
          hashtag.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filteredHashtags);
      } else if (activeTab === "Posts") {
        // Search posts via API
        try {
          const response = await api.get(
            `/posts/search?q=${encodeURIComponent(query)}`
          );
          if (response.data && response.data.success) {
            const fetchedPosts = response.data.data || [];
            setPosts(fetchedPosts);
            setSearchResults(fetchedPosts);

            // Load images for posts
            for (const post of fetchedPosts) {
              await loadPostImage(post);
            }
          } else {
            setSearchResults([]);
          }
        } catch (error) {
          console.error("Post search error:", error);
          setSearchResults([]);
          message.error("Error searching for posts");
        }
      }
    } finally {
      setSearching(false);
    }
  };

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
    setSearchResults([]);

    // Reset search when switching tabs
    if (searchText) {
      performSearch(searchText);
    } else {
      // Show default results based on tab
      setSearchResults(
        key === "Users" ? users : key === "Hashtags" ? hashtags : posts
      );
    }
  };

  // Handle search text change with debounce
  const handleSearchChange = (e) => {
    const newValue = e.target.value;
    setSearchText(newValue);

    // Clear any existing timers
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    // Set a new timer - capture the current value in the closure
    searchTimerRef.current = setTimeout(() => {
      performSearch(newValue); // Pass the current value directly to avoid stale state
    }, 300); // Reduced debounce time for better responsiveness
  };

  // Handle immediate search on Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      // Clear any pending timer
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }

      // Perform search immediately with current input value
      performSearch(e.target.value);
    }
  };

  // Format post date
  const formatPostDate = (dateString) => {
    try {
      if (!dateString) return "";
      return new Date(dateString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.log(error);
      
      return dateString;
    }
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="search-drawer h-full flex flex-col" data-theme={theme}>
      {/* Search input */}
      <div className="p-5">
        <Input
          value={searchText}
          onChange={handleSearchChange}
          onKeyPress={handleKeyPress}
          placeholder={
            activeTab === "Users"
              ? "Search users"
              : activeTab === "Hashtags"
              ? "Search hashtags"
              : "Search posts"
          }
          prefix={
            !searchText && (
              <SearchOutlined
                style={{ color: isDark ? "#a8a8a8" : "#737373" }}
              />
            )
          }
          className="search-input"
          allowClear={{
            clearIcon: (
              <span style={{ color: isDark ? "#a8a8a8" : "#737373" }}>×</span>
            ),
          }}
        />
      </div>

      {/* Tabs - Users, Hashtags, and Posts */}
      <Tabs
        defaultActiveKey="Users"
        activeKey={activeTab}
        onChange={handleTabChange}
        centered
        className={`border-b ${
          isDark ? "border-[#424242]" : "border-gray-200"
        }`}
      >
        <TabPane tab="Users" key="Users" />
        <TabPane tab="Hashtags" key="Hashtags" />
        <TabPane tab="Posts" key="Posts" />
      </Tabs>

      {/* Recent searches */}
      {searchText.length === 0 && (
        <div className="px-5 py-2">
          <p
            className={`text-base py-2 font-semibold ${
              isDark ? "text-[#f5f5f5]" : "text-[#000000]"
            }`}
          >
            Recent searches
          </p>
        </div>
      )}

      {/* Search results */}
      <div
        className={`flex-1 overflow-y-auto ${
          searchText.length > 0 ? "h-full" : "h-[47rem]"
        } hide-scrollbar`}
      >
        {loading || searching ? (
          <div className="flex justify-center pt-10">
            <Spin size="large" />
          </div>
        ) : searchResults.length === 0 ? (
          <Empty
            description={
              <span style={{ color: isDark ? "#a8a8a8" : "#737373" }}>
                {searchText
                  ? `No results found for "${searchText}"`
                  : "No results found"}
              </span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : activeTab === "Users" ? (
          // Users list
          <div className="space-y-3">
            {searchResults.map((user) => (
              <div
                key={user.id || user.username}
                className="search-result-item relative flex items-center space-x-3 p-3 shadow-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => navigateToUserProfile(user.username)}
              >
                <div className="flex-shrink-0">
                  {avatarUrls[user.username] ? (
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={avatarUrls[user.username]}
                      alt={user.username || "User avatar"}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/300x300/gray/white?text=User";
                      }}
                    />
                  ) : (
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        isDark ? "bg-gray-800" : "bg-gray-200"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="focus:outline-none">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold search-result-username">
                          {user.username || "Username"}
                          {user.verified && (
                            <span className="ml-1 text-blue-500">✓</span>
                          )}
                          {user.private && <span className="ml-1">🔒</span>}
                        </p>
                        <p className="text-sm search-result-fullname">
                          {user.firstName} {user.lastName}
                        </p>
                      </div>
                      {user.role && (
                        <p
                          className={`text-xs font-medium ring-1 ring-inset rounded-md whitespace-nowrap px-2 py-0.5 ${
                            isDark
                              ? "bg-[#0A2D44] text-[#58A6FF] ring-[#58A6FF]/30"
                              : "bg-blue-50 text-blue-700 ring-blue-600/20"
                          }`}
                        >
                          {user.role}
                        </p>
                      )}
                    </div>
                    {user.email && (
                      <p
                        className={`w-fit whitespace-nowrap mt-0.5 py-0.5 text-xs font-medium ${
                          isDark ? "text-[#4b96ff]" : "text-[#00376b]"
                        }`}
                      >
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "Hashtags" ? (
          // Hashtags list
          <div className="space-y-3">
            {searchResults.map((hashtag) => (
              <div
                key={hashtag.id}
                className="search-result-item relative flex items-center space-x-3 p-3 shadow-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => navigateToHashtag(hashtag.name)}
              >
                <div className="flex-shrink-0">
                  <div
                    className={`size-10 rounded-full grid place-content-center ${
                      isDark ? "bg-[#262626]" : "bg-gray-100"
                    }`}
                  >
                    <span
                      style={{
                        fontSize: "18px",
                        color: isDark ? "#f5f5f5" : "#262626",
                      }}
                    >
                      #
                    </span>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="focus:outline-none">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold search-result-hashtag">
                          #{hashtag.name}
                        </p>
                        <p
                          className={`text-xs ${
                            isDark ? "text-[#a8a8a8]" : "text-[#737373]"
                          }`}
                        >
                          Added on{" "}
                          {new Date(hashtag.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="search-result-count-badge whitespace-nowrap px-2 py-0.5 text-xs font-medium rounded-md">
                        {hashtag.postCount}{" "}
                        {hashtag.postCount === 1 ? "post" : "posts"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Posts grid - 2 columns
          <div className="grid grid-cols-2 gap-2">
            {searchResults.map((post) => (
              <div
                key={post.id}
                className="cursor-pointer"
                onClick={() => openPostComments(post.id)}
              >
                <div className="relative aspect-square overflow-hidden rounded">
                  {postImageUrls[post.id] ? (
                    <img
                      src={postImageUrls[post.id]}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/300x300/gray/white?text=No+Image";
                      }}
                    />
                  ) : (
                    <div
                      className={`w-full h-full flex items-center justify-center ${
                        isDark ? "bg-gray-800" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`text-sm ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Loading...
                      </span>
                    </div>
                  )}

                  {/* Post info overlay on hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex flex-col justify-end">
                    <div className="p-2 text-white transform translate-y-full hover:translate-y-0 transition-transform duration-200">
                      <h3 className="text-sm font-medium truncate">
                        {post.title}
                      </h3>
                      <p className="text-xs opacity-80">
                        {formatPostDate(post.createdAt || post.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchDrawerContent;
