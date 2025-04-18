"use client";

import { Link, Outlet } from "react-router-dom";
import { useState, useRef } from "react";
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
import { Layout, Menu, Drawer, Button, Spin} from "antd";
import MoreMenu from "../components/MoreMenu";
import { useTheme } from "../context/ThemeContext";

const { Sider, Content } = Layout;

const DashboardLayout = () => {
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const moreButtonRef = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
    if (key === "2") {
      // "Search" key
      showDrawer();
    }
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
            defaultSelectedKeys={["1"]}
            style={{
              fontSize: 16,
              backgroundColor: isDark ? "#000" : "#fff",
            }}
            onClick={handleMenuClick}
            items={[
              {
                key: "1",
                icon: <HomeOutlined style={{ fontSize: 22 }} />,
                label: "Home",
              },
              {
                key: "2",
                icon: <SearchOutlined style={{ fontSize: 22 }} />,
                label: "Search",
              },
              {
                key: "3",
                icon: <CompassOutlined style={{ fontSize: 22 }} />,
                label: "Explore",
              },
              {
                key: "4",
                icon: <BellOutlined style={{ fontSize: 22 }} />,
                label: "Notifications",
              },
              {
                key: "5",
                icon: <PlusSquareOutlined style={{ fontSize: 22 }} />,
                label: "Create",
              },
              {
                key: "6",
                icon: <UserOutlined style={{ fontSize: 22 }} />,
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
          <Content className="overflow-auto hide-scrollbar scroll-smooth">
            <Outlet />
          </Content>
        </Layout>
      </Layout>

      {/* Search Drawer Component */}
      <Drawer
        title="Search"
        destroyOnClose
        placement="right"
        width={400}
        open={drawerOpen}
        onClose={closeDrawer}
        className={isDark ? "drawer-dark" : "drawer-light"}
        data-theme={theme} // Add this attribute explicitly
        // Remove background color inline style
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
          // The key prop forces a complete re-render when theme changes
          <SearchDrawerContent key={`search-drawer-${theme}`} />
        )}
      </Drawer>
    </div>
  );
};

export default DashboardLayout;
