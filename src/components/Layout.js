import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  ArrowUpDown,
  Wallet,
  Target,
  BarChart3,
  Settings as SettingsIcon,
  PlusCircle,
  Sliders,
} from "lucide-react";
import { useTheme } from "../store/ThemeContext";

const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
  >
    <Icon size={24} />
    {label && <span>{label}</span>}
  </NavLink>
);

export const Layout = ({ children }) => {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div
          className="logo"
          style={{
            marginBottom: "2rem",
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "var(--primary)",
          }}
        >
          JMoney
        </div>
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            flex: 1,
          }}
        >
          <NavItem to="/" icon={Home} label="Dashboard" />
          <NavItem to="/transactions" icon={ArrowUpDown} label="Transactions" />
          <NavItem to="/budgets" icon={Wallet} label="Budgets" />
          <NavItem to="/goals" icon={Target} label="Goals" />
          <NavItem to="/reports" icon={BarChart3} label="Reports" />
          <NavItem to="/settings" icon={Sliders} label="Settings" />
        </nav>
        <button className="btn btn-secondary" onClick={toggleTheme}>
          {isDark ? "☀️ Light" : "🌙 Dark"}
        </button>
      </aside>

      <main className="main-content">{children}</main>

      <nav className="bottom-nav">
        <NavItem to="/" icon={Home} />
        <NavItem to="/transactions" icon={ArrowUpDown} />
        <NavItem to="/budgets" icon={Wallet} />
        <NavItem to="/goals" icon={Target} />
        <NavItem to="/reports" icon={BarChart3} />
        <NavItem to="/settings" icon={Sliders} />
      </nav>
    </div>
  );
};
