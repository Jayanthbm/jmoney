import React, { useEffect, useState } from "react";
import "./Toast.css";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

export const Toast = ({ visible, message, type = "info", onHide }) => {
  const [shouldRender, setShouldRender] = useState(visible);

  useEffect(() => {
    if (visible) setShouldRender(true);
  }, [visible]);

  const onAnimationEnd = () => {
    if (!visible) setShouldRender(false);
  };

  if (!shouldRender) return null;

  const icons = {
    error: <AlertCircle size={20} />,
    success: <CheckCircle size={20} />,
    info: <Info size={20} />,
  };

  return (
    <div
      className={`toast-container ${visible ? "slide-in" : "slide-out"} toast-${type}`}
      onAnimationEnd={onAnimationEnd}
    >
      <div className="toast-content">
        <div className="toast-icon">{icons[type]}</div>
        <div className="toast-message">{message}</div>
        <button className="toast-close" onClick={onHide}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
