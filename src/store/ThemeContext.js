import React, { createContext, useContext, useState, useEffect } from "react";

export const Colors = {
  light: {
    background: "#FFFFFF",
    text: "#111827",
    textSecondary: "#6B7280",
    primary: "#3B82F6",
    card: "#F3F4F6",
    border: "#E5E7EB",
    danger: "#EF4444",
    success: "#10B981",
  },
  dark: {
    background: "#111827",
    text: "#F9FAFB",
    textSecondary: "#9CA3AF",
    primary: "#3B82F6",
    card: "#1F2937",
    border: "#374151",
    danger: "#EF4444",
    success: "#10B981",
  },
};

const ThemeContext = createContext({
  isDark: false,
  colors: Colors.light,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("app_theme");
    if (stored) {
      setIsDark(stored === "dark");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setIsDark(prefersDark);
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("app_theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
