"use client";
import { useTheme } from "../../context/ThemeContext";

const DashboardPage = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="hide-scrollbar overscroll-auto">
      <div
        className={`h-96 grid place-content-center ${
          isDark ? "bg-[#000000] text-[#f5f5f5]" : "bg-[#fafafa] text-[#000]"
        }`}
      >
        <div className="text-2xl font-bold">Section 1</div>
        <p
          className={`text-center ${
            isDark ? "text-[#a8a8a8]" : "text-[#737373]"
          }`}
        >
          This content adapts to the current theme
        </p>
      </div>
      <div
        className={`h-96 grid place-content-center ${
          isDark ? "bg-[#1a1a1a] text-[#f5f5f5]" : "bg-[#f5f5f5] text-[#000]"
        }`}
      >
        <div className="text-2xl font-bold">Section 2</div>
        <p
          className={`text-center ${
            isDark ? "text-[#a8a8a8]" : "text-[#737373]"
          }`}
        >
          Theme switching is managed through context
        </p>
      </div>
      <div
        className={`h-96 grid place-content-center ${
          isDark ? "bg-[#000000] text-[#f5f5f5]" : "bg-[#fafafa] text-[#000]"
        }`}
      >
        <div className="text-2xl font-bold">Section 3</div>
        <p
          className={`text-center ${
            isDark ? "text-[#a8a8a8]" : "text-[#737373]"
          }`}
        >
          CSS variables are updated based on the theme
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
