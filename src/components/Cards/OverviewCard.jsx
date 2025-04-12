// src/components/Cards/OverviewCard.jsx

import React from "react";
import "./OverviewCard.css";

const OverviewCard = ({ title, subtitle, children }) => {
  return (
    <div className="overview-card">
      <div className="overview-card-header">
        <h2 className="overview-card-title">{title}</h2>
        <p className="overview-card-subtitle">{subtitle}</p>
      </div>
      <div className="overview-card-body">{children}</div>
    </div>
  );
};

export default OverviewCard;
