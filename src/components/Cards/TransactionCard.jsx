// src/components/Cards/TransactionCard.jsx

import "./TransactionCard.css";

import { formatIndianNumber, formatTimestamp, renderIcon } from "../../utils";

import React from "react";
import { FaExternalLinkAlt } from "react-icons/fa";

const TransactionCard = ({ transaction, onCardClick = () => {} }) => {
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
    product_link = null,
  } = transaction;

  return (
    <div className="transaction-card" onClick={onCardClick}>
      <div className="transaction-left">
        <div
          className={`transaction-icon ${
            type === "Expense" ? "expense" : "income"
          }`}
        >
          {renderIcon(category_icon)}
        </div>
        <div className="transaction-details">
          <div className="category-name">{category_name}</div>
          {description && <div className="description">{description}</div>}

          {transaction_timestamp && (
            <div className="timestamp">
              {formatTimestamp(transaction_timestamp)}
            </div>
          )}
          <div className="payee-info">
            {(payee_logo || product_link) && (
              <>
                {payee_logo && (
                  <>
                    <img
                      src={payee_logo}
                      alt={payee_name}
                      className="transaction-payee-logo"
                    />
                    <span className="payee-name">{payee_name}</span>
                  </>
                )}

                {product_link && (
                  <a
                    href={product_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#007bff", cursor: "pointer" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaExternalLinkAlt
                      size={14}
                      color="#007bff"
                      title="Product Link"
                    />
                  </a>
                )}
              </>
            )}
          </div>
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
        {percentage !== null && (
          <div className="transaction-percentage">{percentage}%</div>
        )}
      </div>
    </div>
  );
};

export default TransactionCard;
