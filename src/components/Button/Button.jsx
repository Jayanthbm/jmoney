// src/components/Button/Button.jsx
import "./Button.css";
import React from "react";

const Button = ({
  icon,
  text,
  variant = "primary", // 'primary', 'danger', etc.
  onClick,
  bgColor,
  className = "",
  disabled = false,
  type = "button",
  fullWidth,
  ariaLabel,
}) => {
  const isIconOnly = icon && !text;

  const getVariantClass = () => {
    switch (variant) {
      case "primary": return "btn-primary";
      case "danger": return "btn-danger";
      case "info": return "btn-info";
      case "warning": return "btn-warning";
      case "success": return "btn-success";
      case "custom": return "";
      default: return "btn-primary";
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
      aria-label={ariaLabel || text}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {text && <span className="btn-text">{text}</span>}
    </button>
  );
};

export default Button;
