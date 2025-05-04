"use client";

import { useRef, useState, useEffect } from "react";
import { Modal, Button } from "antd";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";

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

  const handleReportProblem = () => {
    // Implement report problem functionality
    console.log("Report problem clicked");
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
            onClick={handleReportProblem}
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

export default MoreMenu;
