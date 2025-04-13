// src/components/Cards/ReportCard.jsx

import React from "react";
import "./ReportCard.css";

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
