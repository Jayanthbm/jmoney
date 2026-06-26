// src/components/Cards/BudgetCard.js

import "./BudgetCard.css";

import { MdDelete, MdModeEditOutline } from "react-icons/md";

import ProgressBar from "../Charts/ProgressBar";
import React from "react";
import { formatIndianNumber } from "../../utils";
const BudgetCard = ({
  title,
  amount,
  interval,
  startDate,
  logo,
  onEdit,
  onDelete,
  spent = 0,
  percentage_spent = 0,
  percentage_remaining = 0,
  onClick,
  isCurrentMonth = true,
}) => {
  const isOverSpent = percentage_remaining < 0;
  const trackColor = isOverSpent ? "#ef4444" : "#3ecf8e";
  const remainingValue = amount - spent;

  let heroLabel = "Remaining";
  let heroValueDisplay = null;

  if (!isCurrentMonth) {
    if (remainingValue < 0) {
      heroLabel = "Overspent";
      heroValueDisplay = (
        <span className="red-text">
          {formatIndianNumber(Math.abs(remainingValue))}
        </span>
      );
    } else {
      heroLabel = "Saved";
      heroValueDisplay = formatIndianNumber(remainingValue);
    }
  } else {
    heroLabel = "Remaining";
    heroValueDisplay =
      remainingValue < 0 ? (
        <>
          {formatIndianNumber(0)}{" "}
          <span
            className="red-text"
            style={{ fontSize: "1rem", fontWeight: "600" }}
          >
            (Overspent {formatIndianNumber(Math.abs(remainingValue))})
          </span>
        </>
      ) : (
        formatIndianNumber(remainingValue)
      );
  }

  return (
    <div className="budget-card" onClick={onClick}>
      <div className="budget-card-header">
        <h3 className="budget-card-title">{title}</h3>
        <div
          className="budget-card-actions"
          onClick={(e) => {
            // Prevent triggering the card's onClick when hitting actions
            e.stopPropagation();
          }}
        >
          <button
            className="icon-action-btn"
            onClick={onEdit}
            aria-label="Edit Budget"
          >
            <MdModeEditOutline size={16} />
          </button>
          <button
            className="icon-action-btn danger"
            onClick={onDelete}
            aria-label="Delete Budget"
          >
            <MdDelete size={16} />
          </button>
        </div>
      </div>

      <div className="budget-card-body">
        <div className="budget-hero">
          <span className="hero-label">{heroLabel}</span>
          <span className="hero-value">{heroValueDisplay}</span>
        </div>

        <div className="budget-sub-metrics">
          <div>
            <span className="amount-label">Budgeted</span>
            <span className="amount-value">
              {formatIndianNumber(amount || 0)}
            </span>
          </div>
          <div style={{ textAlign: "right" }}>
            <span className="amount-label">Spent</span>
            <span className="amount-value red-text">
              {formatIndianNumber(spent || 0)}
            </span>
          </div>
        </div>
      </div>

      <div className="budget-card-footer">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ flex: 1 }}>
            <ProgressBar
              value={isOverSpent ? 101 : percentage_remaining}
              color={trackColor}
            />
          </div>
          <span
            style={{
              fontSize: "0.8rem",
              fontWeight: "700",
              color: isOverSpent ? "#ef4444" : "var(--text-muted)",
            }}
          >
            {isOverSpent ? "0" : Math.round(percentage_remaining)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default BudgetCard;
