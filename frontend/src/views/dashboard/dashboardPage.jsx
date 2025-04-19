import React from "react";
import AllBlogsTable from "../../views/dashboard/blogs/AllBlogsTable";
import BlogCommentsPage from "../../views/dashboard/blogs/BlogCommentsPage";
import { useTheme } from "../../context/ThemeContext";

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
      <div className="flex-grow overflow-auto hide-scrollbar pt-16 px-6">
        <AllBlogsTable />
      </div>
      <BlogCommentsPage />
    </div>
  );
};

export default DashboardPage;
