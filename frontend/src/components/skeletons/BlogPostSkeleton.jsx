import React from "react";
import { useTheme } from "../../context/ThemeContext";

const BlogPostSkeleton = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <article
      className={`flex flex-col items-start justify-between animate-pulse ${
        isDark ? "post-dark" : "post-light"
      }`}
    >
      {/* Header with avatar and username */}
      <div className="relative w-full pl-1 pb-2 flex items-center gap-x-2">
        <div
          className={`size-9 rounded-full ${
            isDark ? "bg-gray-700" : "bg-gray-200"
          }`}
        ></div>
        <div className="flex flex-col space-y-1">
          <div
            className={`h-4 w-24 ${
              isDark ? "bg-gray-700" : "bg-gray-200"
            } rounded`}
          ></div>
          <div
            className={`h-3 w-16 ${
              isDark ? "bg-gray-800" : "bg-gray-100"
            } rounded hidden sm:block`}
          ></div>
        </div>
      </div>

      {/* Image placeholder */}
      <div className="relative w-full">
        <div className="aspect-[32/28] w-full overflow-hidden sm:rounded">
          <div
            className={`w-full h-full ${
              isDark ? "bg-gray-800" : "bg-gray-200"
            }`}
          ></div>
        </div>
      </div>

      {/* Post content */}
      <div className="w-full px-1">
        {/* Action buttons */}
        <div className="mt-2 flex items-center gap-x-3">
          <div
            className={`size-7 ${
              isDark ? "bg-gray-700" : "bg-gray-200"
            } rounded-full`}
          ></div>
          <div
            className={`h-4 w-12 ${
              isDark ? "bg-gray-700" : "bg-gray-200"
            } rounded`}
          ></div>
          <div
            className={`size-7 ${
              isDark ? "bg-gray-700" : "bg-gray-200"
            } rounded-full ml-2`}
          ></div>
          <div
            className={`h-4 w-16 ${
              isDark ? "bg-gray-700" : "bg-gray-200"
            } rounded`}
          ></div>
        </div>

        {/* Title and content */}
        <div className="mt-3 space-y-2">
          <div
            className={`h-5 w-3/4 ${
              isDark ? "bg-gray-700" : "bg-gray-200"
            } rounded`}
          ></div>
          <div
            className={`h-4 w-full ${
              isDark ? "bg-gray-700" : "bg-gray-200"
            } rounded`}
          ></div>
          <div
            className={`h-4 w-5/6 ${
              isDark ? "bg-gray-700" : "bg-gray-200"
            } rounded`}
          ></div>
          <div
            className={`h-4 w-2/3 ${
              isDark ? "bg-gray-700" : "bg-gray-200"
            } rounded`}
          ></div>
        </div>

        {/* Hashtags */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          <div
            className={`h-4 w-12 ${
              isDark ? "bg-gray-700" : "bg-gray-200"
            } rounded`}
          ></div>
          <div
            className={`h-4 w-16 ${
              isDark ? "bg-gray-700" : "bg-gray-200"
            } rounded`}
          ></div>
          <div
            className={`h-4 w-14 ${
              isDark ? "bg-gray-700" : "bg-gray-200"
            } rounded`}
          ></div>
        </div>

        {/* Time and comments */}
        <div className="mt-2">
          <div
            className={`h-3 w-24 ${
              isDark ? "bg-gray-700" : "bg-gray-200"
            } rounded block sm:hidden`}
          ></div>
          <div
            className={`h-4 w-32 ${
              isDark ? "bg-gray-700" : "bg-gray-200"
            } rounded hidden sm:block mt-2`}
          ></div>
        </div>

        {/* Comment form */}
        <div
          className={`hidden sm:flex mt-3 items-start space-x-4 border-b pb-2 ${
            isDark ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <div className="w-full">
            <div
              className={`h-12 ${
                isDark ? "bg-gray-800" : "bg-gray-100"
              } rounded`}
            ></div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogPostSkeleton;
