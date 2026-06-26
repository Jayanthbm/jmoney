// src/pages/Goals/components/GoalCard.jsx

import "./GoalCard.css";

import { MdDelete, MdModeEditOutline } from "react-icons/md";

import ProgressBar from "../../../components/Charts/ProgressBar";
import React from "react";
import { formatIndianNumber } from "../../../utils";

const GoalCard = ({
  title,
  progress,
  logo,
  target,
  current,
  onEdit,
  onDelete,
}) => {
  const remainingValue = Math.max(0, target - current);

  return (
    <div className="goal-card">
      <div className="goal-card-header">
        <h3 className="goal-card-title">{title}</h3>
        <div className="goal-card-actions">
          <button
            className="icon-action-btn"
            onClick={onEdit}
            aria-label="Edit Goal"
          >
            <MdModeEditOutline size={16} />
          </button>
          <button
            className="icon-action-btn danger"
            onClick={onDelete}
            aria-label="Delete Goal"
          >
            <MdDelete size={16} />
          </button>
        </div>
      </div>

      <div className="goal-card-body">
        <div className="goal-card-logo-container">
          {logo &&
          (logo.startsWith("http") ||
            logo.startsWith("/") ||
            logo.includes(".")) ? (
            <img src={logo} alt={title} className="goal-card-logo" />
          ) : (
            <span className="goal-emoji">{logo || "🎯"}</span>
          )}
        </div>
        <div className="amount-container">
          <div className="amount-section">
            <span className="amount-label">TARGET</span>
            <span className="amount-value red-text">
              {formatIndianNumber(target || 0)}
            </span>
          </div>

          <div className="divider" />

          <div className="amount-section">
            <span className="amount-label">CURRENT</span>
            <span className="amount-value green-text">
              {formatIndianNumber(current || 0)}
            </span>
          </div>
        </div>
      </div>

      <div className="goal-card-footer">
        <div className="progress-text-row">
          <span className="progress-percent">{Math.round(progress)}%</span>
          <span className="remaining-label">
            {remainingValue > 0
              ? `${formatIndianNumber(remainingValue)} left`
              : "Goal Reached! 🎉"}
          </span>
        </div>
        <ProgressBar value={progress} color="#3ecf8e" />
      </div>
    </div>
  );
};

export default GoalCard;
