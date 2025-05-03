// src/components/Layouts/PageHeader.jsx

import { FiRefreshCw } from "react-icons/fi";
import { IoIosArrowBack } from "react-icons/io";
import React from "react";

const PageHeader = ({ title, showRefreshButton, onRefresh, disabled, onBack }) => {
  return (
    <div className="header-container">
      <div
        className={`header-title-wrapper ${onBack ? "clickable" : ""}`}
        onClick={() => {
          if (onBack) {
            onBack();
          }
        }}
      >
        {onBack && (
          <div className="header-back-button" role="button" aria-label="Go back">
            <IoIosArrowBack />
          </div>
        )}
        <div className="header-title">{title}</div>
      </div>
      {showRefreshButton && (
        <button
          className="refresh-button"
          onClick={onRefresh}
          disabled={disabled}
          aria-label="Refresh"
        >
          <FiRefreshCw className="refresh-icon" />
        </button>
      )}
    </div>
  );
};

export default PageHeader;
