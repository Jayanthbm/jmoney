import React from "react";
import * as MdIcons from "react-icons/md";
import "./TransactionCard.css";
import { format } from "date-fns";
import { formatIndianNumber } from "../utils";

const renderIcon = (iconName, size = 36) => {
  const Icon = MdIcons[iconName];
  return Icon ? <Icon size={size} /> : null;
};

const TransactionCard = ({
  transaction,
  onCategoryClick = () => {},
  onPayeeClick = () => {},
}) => {
  const {
    amount,
    category_name,
    category_icon,
    description,
    payee_name,
    payee_logo,
    type,
    transaction_timestamp,
    percentage = null,
  } = transaction;

  const formattedTime = transaction_timestamp
    ? format(new Date(transaction_timestamp), "dd MMM yy hh:mm a")
    : "";

  return (
    <div className="transaction-card">
      <div className="transaction-left">
        <div
          className={`transaction-icon ${
            type === "Expense" ? "expense" : "income"
          }`}
        >
          {renderIcon(category_icon)}
        </div>
        <div className="transaction-details">
          <div
            className="category-name clickable"
            onClick={() => onCategoryClick(transaction)}
          >
            {category_name}
          </div>

          {description && <div className="description">{description}</div>}

          {transaction_timestamp && (
            <div className="timestamp">{formattedTime}</div>
          )}

          {payee_name && (
            <div
              className="payee-info clickable"
              onClick={() => onPayeeClick(transaction)}
            >
              {payee_logo && (
                <img
                  src={payee_logo}
                  alt={payee_name}
                  className="transaction-payee-logo"
                />
              )}
              <span className="payee-name">{payee_name}</span>
            </div>
          )}
        </div>
      </div>

      <div className="transaction-amount-section">
        <div
          className={`transaction-amount ${
            type === "Expense" ? "expense" : "income"
          }`}
        >
          {formatIndianNumber(Number(amount))}
        </div>
        {percentage && (
          <div className="transaction-percentage">{percentage}%</div>
        )}
      </div>
    </div>
  );
};

export default TransactionCard;
