// src/components/Button/Button.jsx
import React from "react";
import "./Button.css";

const Button = ({
  icon,
  text,
  variant = "primary", // 'primary', 'danger', 'info', 'warning', 'success', 'custom'
  onClick,
  bgColor, // only used if variant is 'custom'
  className = "",
  disabled = false,
  type = "button",
  fullWidth,
}) => {
  const isIconOnly = icon && !text;

  const getVariantClass = () => {
    switch (variant) {
      case "primary":
        return "btn-primary";
      case "danger":
        return "btn-danger";
      case "info":
        return "btn-info";
      case "warning":
        return "btn-warning";
      case "success":
        return "btn-success";
      case "custom":
        return "";
      default:
        return "btn-primary";
    }
  };

  const styles = variant === "custom" ? { backgroundColor: bgColor } : {};

  return (
    <button
      type={type}
      className={`btn ${getVariantClass()} ${
        isIconOnly ? "btn-icon-only" : ""
      } ${className} ${fullWidth ? "full-width" : ""}`}
      style={styles}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {text && <span className="btn-text">{text}</span>}
    </button>
  );
};

export default Button;
