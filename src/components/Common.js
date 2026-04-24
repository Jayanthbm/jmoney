import React from "react";

export const Button = ({
  children,
  onClick,
  variant = "primary",
  disabled,
  className = "",
  ...props
}) => {
  const baseStyles =
    "px-4 py-2 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100";
  const variants = {
    primary: "bg-[var(--primary)] text-white shadow-lg shadow-blue-500/20",
    secondary:
      "bg-[var(--card)] text-[var(--text)] border border-[var(--border)]",
    danger: "bg-[var(--danger)] text-white shadow-lg shadow-red-500/20",
    ghost:
      "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text)]",
  };

  // Note: Using standard CSS classes instead of Tailwind since Tailwind is not confirmed.
  // I will define these in App.css or a dedicated CSS file.

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input = ({ label, ...props }) => {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <input className="input-field" {...props} />
    </div>
  );
};

export const Card = ({ children, className = "" }) => {
  return <div className={`card ${className}`}>{children}</div>;
};
