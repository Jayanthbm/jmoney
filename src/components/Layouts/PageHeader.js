import React from "react";
import { FiRefreshCw } from "react-icons/fi";

const PageHeader = ({ title, showRefreshButton, onRefresh, disabled }) => {
  return (
    <div className="header-container">
      <h1>{title}</h1>
      {showRefreshButton && (
        <button
          className="refresh-button"
          onClick={onRefresh}
          disabled={disabled}
        >
          <FiRefreshCw className="refresh-icon" />
        </button>
      )}
    </div>
  );
};

export default PageHeader;
