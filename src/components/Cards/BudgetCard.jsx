// src/components/Cards/BudgetCard.js

import "./BudgetCard.css"; // optional

import { MdDelete, MdModeEditOutline } from "react-icons/md";

import Button from "../Button/Button";
import CircularProgressBar from "../Charts/CircularProgressBar";
import React from "react";
import { formatIndianNumber } from "../../utils";
import useTheme from "../../hooks/useTheme";

const BudgetCard = ({
  title,
  amount,
  interval,
  startDate,
  logo,
  onEdit,
  onDelete,
  spent= 0,
  percentage_spent= 10,
  percentage_remaining= 90,
  onClick
}) => {
  const theme = useTheme();

  return (
    <div className="budget-card" >
      <div className="budget-card-header">
        <div className="budget-card-title">{title} </div>
        <div className="budget-progress">
          <CircularProgressBar
            progress={percentage_remaining}
            text={`${Math.round(percentage_remaining)}%`}
            pathColor="#3ecf8e"
            textColor={theme === "dark" ? "#f1f1f1" : "#374151"}
            fontSize="13px"
            size={40}
            strokeWidth={4}
          />
        </div>
      </div>
      <div className="budget-card-body" onClick={onClick}>
        <div className="budget-amount-container">

          {/* Remaining */}
          <div>
            <div className="amount-label">Budgeted</div>
            <div className="amount-value green-text">
              {formatIndianNumber(amount || 0)}
            </div>
          </div>

          {/* Divider */}
          <div className="divider" />

          {/* Spent */}
          <div>
            <div className="amount-label">Spent</div>
            <div className="amount-value red-text">
              {formatIndianNumber(spent || 0)}
            </div>
          </div>

          {/* Divider */}
          <div className="divider" />

          {/* Remaining */}
          <div>
             <div className="amount-label">Remaining</div>
            <div className="amount-value ">
              {formatIndianNumber(amount - spent || 0)}
            </div>
          </div>
        </div>
      </div>
      <div className="budget-card-actions">
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

export default BudgetCard;
