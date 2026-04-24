import React from "react";
import { ChevronRight } from "lucide-react";

export const SettingRow = ({
  icon: Icon,
  title,
  value,
  onPress,
  color,
  showArrow = true,
  isLoading = false,
}) => {
  return (
    <div
      className={`setting-row ${onPress ? "clickable" : ""}`}
      onClick={onPress}
      style={color ? { color } : {}}
    >
      <div
        className="setting-icon-box"
        style={color ? { backgroundColor: `${color}15`, color } : {}}
      >
        <Icon size={20} />
      </div>
      <div className="setting-info">
        <div className="setting-title" style={color ? { color } : {}}>
          {title}
        </div>
        {value && <div className="setting-value">{value}</div>}
      </div>
      {isLoading ? (
        <div className="setting-loading animate-spin">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
        </div>
      ) : (
        showArrow &&
        onPress && <ChevronRight size={18} className="setting-arrow" />
      )}
    </div>
  );
};
