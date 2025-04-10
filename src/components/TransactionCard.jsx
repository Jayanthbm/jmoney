import React from "react";
import * as MdIcons from "react-icons/md";
import "./TransactionCard.css";

const renderIcon = (iconName, size = 28) => {
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
  } = transaction;

  return (
    <div className="transaction-card">
      <div className="transaction-left">
        <div
          className={`transaction-icon ${
            type === "Expense" ? "expense" : "income"
          }`}
        >
          {renderIcon(category_icon, 36)}
        </div>
        <div className="transaction-details">
          <div
            className="category-name clickable"
            onClick={() => onCategoryClick(transaction)}
          >
            {category_name}
          </div>
          {description && <div className="description">{description}</div>}
          {payee_name && (
            <div
              className="payee-info clickable"
              onClick={() => onPayeeClick(transaction)}
            >
              {payee_logo && (
                <img src={payee_logo} alt={payee_name} className="transaction-payee-logo" />
              )}
              <span className="payee-name">{payee_name}</span>
            </div>
          )}
        </div>
      </div>
      <div
        className={`transaction-amount ${
          type === "Expense" ? "expense" : "income"
        }`}
      >
        ₹{Number(amount).toFixed(2)}
      </div>
    </div>
  );
};

export default TransactionCard;
