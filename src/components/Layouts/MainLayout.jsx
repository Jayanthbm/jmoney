// src/components/Layouts/MainLayout.jsx

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MdLogout,
  MdSettings,
  MdDashboard,
  MdListAlt,
  MdAccountBalanceWallet,
  MdFlag,
  MdBarChart,
  MdDarkMode,
  MdLightMode,
} from "react-icons/md";
import { supabase } from "../../supabaseClient";
import "./MainLayout.css";
import { updateThemeColorMetaTag } from "../../utils/themeUtils";

const navItems = [
  { label: "Overview", path: "/", icon: <MdDashboard /> },
  { label: "Transactions", path: "/transactions", icon: <MdListAlt /> },
  { label: "Budgets", path: "/budgets", icon: <MdAccountBalanceWallet /> },
  { label: "Goals", path: "/goals", icon: <MdFlag /> },
  { label: "Reports", path: "/reports", icon: <MdBarChart /> },
  { label: "Settings", path: "/settings", icon: <MdSettings /> },
];

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selected, setSelected] = useState(location.pathname);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    setSelected(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Optionally, navigate to login page here
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    // Update theme-color meta dynamically
    updateThemeColorMetaTag(theme === "light" ? "#2684ff" : "#121212"); // example dark value
  }, [theme]);

  return (
    <div className="main-layout">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="logo" onClick={() => navigate("/")}>
            Jmoney
          </div>
        </div>
        <div className="header-right">
          {/* Settings Icon (visible only on mobile) */}
          <div className="mobile-only">
            <div className="icon-button" onClick={() => navigate("/settings")}>
              <MdSettings size={20} />
            </div>
          </div>

          <div className="icon-button" onClick={toggleTheme}>
            {theme === "light" ? (
              <MdDarkMode size={20} title="Switch to dark mode" />
            ) : (
              <MdLightMode size={20} title="Switch to light mode" />
            )}
          </div>

          {/* Logout Icon */}
          <div className="icon-button" onClick={handleLogout}>
            <MdLogout size={20} />
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="content-area">
        {/* Sidebar for desktop */}
        <aside className="sidebar">
          <nav>
            {navItems.map((item) => (
              <div
                key={item.path}
                className={`nav-item ${selected === item.path ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="content">{children}</main>
      </div>

      {/* Mobile Footer Navigation */}
      <footer className="mobile-footer">
        {navItems
          .filter((item) => item.path !== "/settings")
          .map((item) => (
            <div
              key={item.path}
              className={`footer-nav-item ${
                selected === item.path ? "active" : ""
              }`}
              onClick={() => navigate(item.path)}
            >
              <div className="footer-icon">{item.icon}</div>
              <div className="footer-label">{item.label}</div>
            </div>
          ))}
      </footer>
    </div>
  );
};

export default MainLayout;
