// src/components/Cards/ReportCard.jsx

import "./ReportCard.css";

import React from "react";

const ReportCard = ({ icon, title, description }) => {
  return (
    <div className="report-card">
      <div className="report-icon">{icon}</div>
      <div className="report-content">
        <div className="report-title">{title}</div>
        {description && <div className="report-description">{description}</div>}
      </div>
    </div>
  );
};

export default ReportCard;
