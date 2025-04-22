"use client";

import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import SearchDrawerContent from "../views/dashboard/blogs/SearchDrawerContent";
import {
  HomeOutlined,
  HomeFilled,
  SearchOutlined,
  CompassOutlined,
  CompassFilled,
  PlusSquareOutlined,
  PlusSquareFilled,
  BellOutlined,
  BellFilled,
  UserOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Drawer, Spin, Badge } from "antd";
// import MoreMenu from "../components/MoreMenu";
import { useTheme } from "../context/ThemeContext";
import { Outlet } from "react-router-dom";
import { api } from "../helpers/api";
import { useAuth } from "../context/AuthContext";
import { Modal } from "antd";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import ReportProblemModal from "../components/modals/ReportProblemModal";

const { Sider, Content } = Layout;

const DashboardLayout = () => {
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState("1");
  const [unreadCount, setUnreadCount] = useState(0);

  const moreButtonRef = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const location = useLocation();

  const [reportModalOpen, setReportModalOpen] = useState(false);
  
  // Fetch notification count
  const fetchNotificationCount = async () => {
    try {
      const response = await api.get("/notifications");
      if (response.data && response.data.success) {
        setUnreadCount(response.data.data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  // Set the selected key based on the current path
  useEffect(() => {
    if (location.pathname === "/" || location.pathname === "/dashboard") {
      setSelectedKey("1");
    } else if (location.pathname === "/explore") {
      setSelectedKey("3");
    } else if (location.pathname.includes("/notifications")) {
      setSelectedKey("4");
      // Clear badge when on notifications page
      setUnreadCount(0);
    } else if (location.pathname.includes("/create")) {
      setSelectedKey("5");
    } else if (location.pathname.includes("/profile")) {
      setSelectedKey("6");
    }
  }, [location.pathname]);

  // Fetch notification count when component mounts and periodically
  useEffect(() => {
    // Fetch immediately on mount
    fetchNotificationCount();

    // Then set up interval to refresh (every 30 seconds)
    const intervalId = setInterval(() => {
      // Don't fetch if user is on notifications page
      if (!location.pathname.includes("/notifications")) {
        fetchNotificationCount();
      }
    }, 30000);

    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [location.pathname]);

  const showMoreMenu = () => {
    setMoreMenuVisible(true);
  };

  const hideMoreMenu = () => {
    setMoreMenuVisible(false);
  };

  const showDrawer = () => {
    setDrawerOpen(true);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const handleMenuClick = ({ key }) => {
    setSelectedKey(key);

    if (key === "1") {
      navigate("/");
    } else if (key === "2") {
      // "Search" key
      showDrawer();
    } else if (key === "3") {
      navigate("/explore");
    } else if (key === "4") {
      navigate("/notifications");
    } else if (key === "5") {
      navigate("/create");
    } else if (key === "6") {
      navigate("/profile");
    }
  };

  //More menu component
  const MoreMenu = ({ buttonRef, visible, onClose }) => {
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const menuRef = useRef(null);

    // Handle click outside to close the menu
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          visible &&
          menuRef.current &&
          !menuRef.current.contains(event.target) &&
          buttonRef.current &&
          !buttonRef.current.contains(event.target)
        ) {
          onClose();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [visible, onClose, buttonRef]);

    // Calculate position based on the button's position
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
      if (visible && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({
          top: rect.top - 160, // Position above the button
          left: rect.left + 4,
        });
      }
    }, [visible, buttonRef]);

    const handleLogout = () => {
      logout();
      onClose();
    };

    const handleThemeChange = () => {
      toggleTheme();
      onClose();
    };

    const isDark = theme === "dark";

    return (
      <Modal
        open={visible}
        footer={null}
        closable={false}
        style={{
          position: "absolute",
          top: `${position.top}px`,
          left: `${position.left}px`,
          margin: 0,
          padding: 0,
          borderRadius: 8,
          overflow: "hidden",
        }}
        width={200}
        maskClosable={true}
        onCancel={onClose}
      >
        <div
          ref={menuRef}
          className={`${
            isDark ? "bg-[#262626] text-[#f5f5f5]" : "bg-white text-[#000]"
          }`}
        >
          <div className="p-2 flex flex-col items-start gap-1">
            <button
              onClick={handleThemeChange}
              className={`w-full text-left px-2 py-1 rounded-md transition-all flex items-center justify-start mb-1 font-semibold
    ${isDark ? "text-white hover:bg-white/10" : "text-black hover:bg-black/5"}
  `}
            >
              {isDark ? (
                <SunIcon className="h-5 w-5 mr-2" />
              ) : (
                <MoonIcon className="h-5 w-5 mr-2" />
              )}
              {isDark ? "Switch to Light" : "Switch to Dark"}
            </button>

            <button
              onClick={() =>{setReportModalOpen(true); hideMoreMenu()}}
              className={`w-full text-left px-2 py-1 rounded-md transition-all flex items-center justify-start mb-1 font-semibold
    ${isDark ? "text-white hover:bg-white/10" : "text-black hover:bg-black/5"}
  `}
            >
              <span className="mr-2">🚨</span>
              Report a Problem
            </button>

            <button
              onClick={handleLogout}
              className={`w-full text-left px-2 py-1 rounded-md transition-all flex items-center justify-start text-red-500  font-semibold ${
                isDark ? "hover:bg-white/10" : "hover:bg-red-100"
              }`}
            >
              <span className="mr-2">‼️</span>
              Log Out
            </button>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div className="h-full">
      <Layout className="h-full" hasSider>
        <Sider
          theme={isDark ? "dark" : "light"}
          trigger={null}
          style={{
            paddingTop: "8px",
            paddingLeft: "12px",
            paddingRight: "12px",
            paddingBottom: "22px",
            borderRight: `1px solid ${
              isDark ? "var(--border-dark)" : "var(--border-light)"
            }`,
            backgroundColor: isDark ? "#000" : "#fff",
          }}
        >
          <Link
            to="/"
            className={`flex items-center justify-center space-x-2 h-12 py-3 mb-4 ${
              isDark
                ? "text-[#f5f5f5] hover:text-white"
                : "text-[#000] hover:text-gray-800"
            }`}
          >
            <span className="text-lg font-semibold">MilliyGram</span>
          </Link>

          <Menu
            className="space-y-3"
            theme={isDark ? "dark" : "light"}
            selectedKeys={[selectedKey]}
            style={{
              fontSize: 16,
              backgroundColor: isDark ? "#000" : "#fff",
            }}
            onClick={handleMenuClick}
            items={[
              {
                key: "1",
                icon:
                  selectedKey === "1" ? (
                    <HomeFilled style={{ fontSize: 22 }} />
                  ) : (
                    <HomeOutlined style={{ fontSize: 22 }} />
                  ),
                label: "Home",
              },
              {
                key: "2",
                icon: <SearchOutlined style={{ fontSize: 22 }} />,
                label: "Search",
              },
              {
                key: "3",
                icon:
                  selectedKey === "3" ? (
                    <CompassFilled style={{ fontSize: 22 }} />
                  ) : (
                    <CompassOutlined style={{ fontSize: 22 }} />
                  ),
                label: "Explore",
              },
              {
                key: "4",
                icon:
                  selectedKey === "4" ? (
                    <Badge count={0}>
                      <BellFilled style={{ fontSize: 22 }} />
                    </Badge>
                  ) : (
                    <Badge
                      className="z-99"
                      count={unreadCount}
                      overflowCount={10}
                    >
                      <BellOutlined style={{ fontSize: 22 }} />
                    </Badge>
                  ),
                label: "Notifications",
              },
              {
                key: "5",
                icon:
                  selectedKey === "5" ? (
                    <PlusSquareFilled style={{ fontSize: 22 }} />
                  ) : (
                    <PlusSquareOutlined style={{ fontSize: 22 }} />
                  ),
                label: "Create",
              },
              {
                key: "6",
                icon:
                  selectedKey === "6" ? (
                    <UserOutlined style={{ fontSize: 22 }} />
                  ) : (
                    <UserOutlined style={{ fontSize: 22 }} />
                  ),
                label: "Profile",
              },
            ]}
          />

          <button
            ref={moreButtonRef}
            onClick={showMoreMenu}
            className={`flex items-center gap-3 mx-1 px-4 py-2 mt-auto text-base rounded-md transition ${
              isDark
                ? "text-[#f5f5f5] hover:bg-white/10"
                : "text-[#000] hover:bg-black/5"
            }`}
          >
            <MenuOutlined style={{ fontSize: 22 }} />
            <span>More</span>
          </button>

          <MoreMenu
            buttonRef={moreButtonRef}
            visible={moreMenuVisible}
            onClose={hideMoreMenu}
          />
        </Sider>

        <Layout style={{ backgroundColor: isDark ? "#000" : "#fff" }}>
          <Content
            className="overflow-auto hide-scrollbar scroll-smooth"
            data-theme={theme}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>

      {/* Search Drawer Component */}
      <Drawer
        title="Search"
        destroyOnClose
        placement="right"
        width={500}
        open={drawerOpen}
        onClose={closeDrawer}
        className={isDark ? "drawer-dark" : "drawer-light"}
        data-theme={theme}
      >
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "40px",
            }}
          >
            <Spin size="large" />
          </div>
        ) : (
          <SearchDrawerContent
            key={`search-drawer-${theme}`}
            onClose={closeDrawer}
          />
        )}
      </Drawer>

      <ReportProblemModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
    </div>
  );
};

export default DashboardLayout;
