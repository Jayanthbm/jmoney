import React from "react";
import "./GoalCard.css";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import { formatIndianNumber } from "../utils";
const GoalCard = ({
  title,
  progress,
  logo,
  target,
  current,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="goal-card">
      <div className="goal-card-header">
        <div className="goal-card-title">{title}</div>
        <div className="goal-progress">
          <CircularProgressbar
            value={progress}
            text={`${Math.round(progress)}%`}
            styles={buildStyles({
              pathColor: "#4caf50",
              textColor: "#374752",
              trailColor: "#eee",
            })}
          />
        </div>
      </div>
      <div className="goal-card-body">
        <div className="goal-card-logo-container">
          <img src={logo} alt={title} className="goal-card-logo" />
        </div>
        <div className="amount-container">
          {/* Remaining */}
          <div className="amount-section">
            <div className="amount-label">TARGET</div>
            <div className="amount-value red-text">
              ₹{formatIndianNumber(target || 0)}
            </div>
          </div>

          {/* Divider */}
          <div className="divider" />

          {/* Spent */}
          <div className="amount-section">
            <div className="amount-label">CURRENT</div>
            <div className="amount-value green-text">
              ₹{formatIndianNumber(current || 0)}
            </div>
          </div>
        </div>
      </div>
      <div className="goal-card-actions">
        <button className="goal-edit-btn" onClick={onEdit}>
          Edit
        </button>
        <button className="goal-delete-btn" onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default GoalCard;
