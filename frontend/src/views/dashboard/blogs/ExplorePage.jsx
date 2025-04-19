import React from "react";
import { useTheme } from "@/context/ThemeContext";

const ExplorePage = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className="explore-container h-full p-6 flex flex-col"
      data-theme={theme}
      style={{
        backgroundColor: isDark ? "#000" : "#fff",
        color: isDark ? "#f5f5f5" : "#000",
      }}
    >
      <h1 className="text-2xl font-bold mb-4">Explore</h1>
      <div className="flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Content will go here */}
          <div
            className={`p-4 rounded-lg ${
              isDark ? "bg-gray-900" : "bg-gray-100"
            }`}
          >
            <p>Explore content will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
