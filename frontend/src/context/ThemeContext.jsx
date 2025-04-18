"use client";

import { createContext, useContext, useState, useEffect } from "react";

// Create a context for theme management
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or default to 'light'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme || "light";
  });

  // Apply theme changes to the document
  useEffect(() => {
    // Save theme preference to localStorage
    localStorage.setItem("theme", theme);

    // Apply theme to document body
    document.body.setAttribute("data-theme", theme);

    // Update CSS variables based on theme
    if (theme === "dark") {
      document.documentElement.style.setProperty("--bg-primary", "#ffffff");
      document.documentElement.style.setProperty("--bg-secondary", "#000000");
      document.documentElement.style.setProperty(
        "--text-primary",
        "var(--text-primary-dark)"
      );
      document.documentElement.style.setProperty(
        "--text-secondary",
        "var(--text-secondary-dark)"
      );
      document.documentElement.style.setProperty(
        "--border",
        "var(--border-dark)"
      );
      document.documentElement.style.setProperty(
        "--link-primary",
        "var(--link-primary-dark)"
      );
    } else {
      document.documentElement.style.setProperty("--bg-primary", "#fff");
      document.documentElement.style.setProperty("--bg-secondary", "#fafafa");
      document.documentElement.style.setProperty(
        "--text-primary",
        "var(--text-primary-light)"
      );
      document.documentElement.style.setProperty(
        "--text-secondary",
        "var(--text-secondary-light)"
      );
      document.documentElement.style.setProperty(
        "--border",
        "var(--border-light)"
      );
      document.documentElement.style.setProperty(
        "--link-primary",
        "var(--link-primary-light)"
      );
    }
  }, [theme]);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === "dark",
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
