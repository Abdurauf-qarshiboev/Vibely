import React, { useState, useEffect } from "react";
import { Input, Tabs, Empty, Spin } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useTheme } from "@/context/ThemeContext";
import { api, URL } from "../../../helpers/api";

const { TabPane } = Tabs;

const SearchDrawerContent = () => {
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("Users");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [hashtags, setHashtags] = useState([]);

  // Use the theme context with a force update mechanism
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Force re-render when theme changes
  const [, forceUpdate] = useState({});
  useEffect(() => {
    // This will force the component to re-render when theme changes
    forceUpdate({});
  }, [theme]);

  // Fetch users and hashtags when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch hashtags
        const hashtagsResponse = await api.get("/hashtags/trending");
        if (hashtagsResponse.data?.success) {
          setHashtags(hashtagsResponse.data.data || []);
        }

        // For users, you might need to fetch from a different endpoint
        const usersResponse = await api.get("/users/suggested");
        if (usersResponse.data?.success) {
          setUsers(usersResponse.data.data || []);
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
        setUsers([
          {
            id: 1,
            username: "admin3",
            firstName: "Admin3",
            lastName: "Ultra",
            email: "admin3@example.com",
            role: "USER",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter data based on search text
  useEffect(() => {
    if (!searchText) {
      // When no search text, show all data
      setSearchResults(activeTab === "Users" ? users : hashtags);
      return;
    }

    const query = searchText.toLowerCase();

    if (activeTab === "Users") {
      // Filter users by username, firstName, lastName, or email
      const filteredUsers = users.filter(
        (user) =>
          user.username?.toLowerCase().includes(query) ||
          user.firstName?.toLowerCase().includes(query) ||
          user.lastName?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query)
      );
      setSearchResults(filteredUsers);
    } else {
      // Filter hashtags - if search starts with #, remove it for comparison
      const searchQuery = query.startsWith("#") ? query.substring(1) : query;
      const filteredHashtags = hashtags.filter((hashtag) =>
        hashtag.name?.toLowerCase().includes(searchQuery)
      );
      setSearchResults(filteredHashtags);
    }
  }, [searchText, activeTab, users, hashtags]);

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  return (
    <div className="search-drawer h-full flex flex-col" data-theme={theme}>
      {/* Search input */}
      <div className="p-5">
        <Input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder={
            activeTab === "Users" ? "Search by username" : "Search by hashtag"
          }
          prefix={
            !searchText && (
              <SearchOutlined
                style={{ color: isDark ? "#a8a8a8" : "#737373" }}
              />
            )
          }
          className="search-input"
          // Remove background-color from inline style
          style={{
            color: isDark ? "#f5f5f5" : "#000",
            borderColor: isDark ? "#424242" : "#d9d9d9",
            borderRadius: "0.5rem",
          }}
          allowClear={{
            clearIcon: (
              <span style={{ color: isDark ? "#a8a8a8" : "#737373" }}>×</span>
            ),
          }}
        />
      </div>

      {/* Tabs - Users and Hashtags */}
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
      </Tabs>

      {/* Recent searches */}
      {searchText.length === 0 && (
        <div className="px-5 py-2">
          <p
            className="text-base py-2 font-semibold"
            style={{
              color: isDark
                ? "var(--text-primary-dark)"
                : "var(--text-primary-light)",
            }}
          >
            Recent searches
          </p>
        </div>
      )}

      {/* Search results */}
      <div
        className={`flex-1 overflow-y-auto p-4 ${
          searchText.length > 0 ? "h-full" : "h-[47rem]"
        } hide-scrollbar`}
      >
        {loading ? (
          <div className="flex justify-center pt-10">
            <Spin size="large" />
          </div>
        ) : searchResults.length === 0 ? (
          <Empty
            description={
              <span style={{ color: isDark ? "#a8a8a8" : "#737373" }}>
                No results found
              </span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : activeTab === "Users" ? (
          // Users list
          <div className="space-y-3">
            {searchResults.map((user) => (
              <div
                key={user.id}
                className={`search-result-item relative flex items-center space-x-3 p-3 shadow-sm ${
                  isDark
                    ? "bg-[#121212] border-[#424242]"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex-shrink-0">
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={
                      user.avatar ||
                      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    }
                    alt={user.username || "User avatar"}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <a
                    href={`/profile/${user.id}`}
                    className="focus:outline-none"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold search-result-username">
                          {user.username || "Username"}
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
                        className="w-fit whitespace-nowrap mt-0.5 py-0.5 text-xs font-medium"
                        style={{ color: isDark ? "#4b96ff" : "#00376b" }}
                      >
                        {user.email}
                      </p>
                    )}
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Hashtags list
          <div className="space-y-3">
            {searchResults.map((hashtag) => (
              <div
                key={hashtag.id}
                className={`search-result-item relative flex items-center space-x-3 p-3 shadow-sm ${
                  isDark
                    ? "bg-[#121212] border-[#424242]"
                    : "bg-white border-gray-200"
                }`}
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
                  <a
                    href={`/explore/tags/${hashtag.name}`}
                    className="focus:outline-none"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold search-result-hashtag">
                          #{hashtag.name}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: isDark ? "#a8a8a8" : "#737373" }}
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
                  </a>
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
