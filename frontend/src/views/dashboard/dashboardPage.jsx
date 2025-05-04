import React from "react";
import AllBlogsTable from "../../views/dashboard/blogs/AllBlogsTable";
import BlogCommentsPage from "../../views/dashboard/blogs/BlogCommentsPage";
import { useTheme } from "../../context/ThemeContext";
import { Button, Tooltip } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
const DashboardPage = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className="dashboard-container h-full flex flex-col"
      data-theme={theme}
      style={{
        backgroundColor: isDark ? "#000" : "#fff",
        color: isDark ? "#f5f5f5" : "#000",
      }}
    >
      <div className="flex-grow overflow-auto hide-scrollbar">
        <div
          className={`${
            isDark
              ? "bg-black/60 border-b-white/30"
              : "bg-white/60 border-b-gray-300"
          } backdrop-blur-[8px] flex justify-end items-center px-10 sticky h-16 top-0 z-50 border-b`}
        >
          <div className="p-3">
            <Tooltip title="Refresh the feed">
              <Button
                className={` ${
                  isDark
                    ? "bg-black text-white hover:bg-black"
                    : "bg-white text-black"
                }`}
                icon={<ReloadOutlined />}
                onClick={() => window.location.reload()}
              ></Button>
            </Tooltip>
          </div>
        </div>
        <AllBlogsTable />
      </div>
      <BlogCommentsPage />
    </div>
  );
};

export default DashboardPage;
