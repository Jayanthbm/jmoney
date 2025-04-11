import React from "react";
import { MdModeEditOutline, MdDelete } from "react-icons/md";
import CircularProgressBar from "./CircularProgressBar";
import Button from "./Button";
import { formatIndianNumber } from "../utils";
import "./GoalCard.css";
import useTheme from "../hooks/useTheme";

const GoalCard = ({
  title,
  progress,
  logo,
  target,
  current,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();
  return (
    <div className="goal-card">
      <div className="goal-card-header">
        <div className="goal-card-title">{title}</div>
        <div className="goal-progress">
          <CircularProgressBar
            progress={progress}
            text={`${Math.round(progress)}%`}
            pathColor="#3ecf8e"
            textColor={theme === "dark" ? "#f1f1f1" : "#374151"}
            fontSize="13px"
            size={40}
            strokeWidth={4}
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
              {formatIndianNumber(target || 0)}
            </div>
          </div>

          {/* Divider */}
          <div className="divider" />

          {/* Spent */}
          <div className="amount-section">
            <div className="amount-label">CURRENT</div>
            <div className="amount-value green-text">
              {formatIndianNumber(current || 0)}
            </div>
          </div>
        </div>
      </div>
      <div className="goal-card-actions">
        <Button
          icon={<MdModeEditOutline />}
          variant="primary"
          onClick={onEdit}
        />
        <Button icon={<MdDelete />} variant="danger" onClick={onDelete} />
      </div>
    </div>
  );
};

export default GoalCard;
