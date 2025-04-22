import React from "react";
import { useTheme } from "@/context/ThemeContext";

const ExplorePostSkeleton = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="aspect-square animate-pulse">
      <div
        className={`w-full h-full ${isDark ? "bg-gray-800" : "bg-gray-200"}`}
      ></div>
    </div>
  );
};

export default ExplorePostSkeleton;
