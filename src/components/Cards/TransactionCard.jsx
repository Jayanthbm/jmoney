// src/components/Cards/TransactionCard.jsx

import "./TransactionCard.css";

import { formatIndianNumber, formatTimestamp, renderIcon } from "../../utils";

import React from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";

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
    latitude = null,
    longitude = null,
  } = transaction;

  const googleMapsLink =
    latitude && longitude
      ? `https://www.google.com/maps?q=${latitude},${longitude}`
      : null;

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
            <div className="payee-left">
              {payee_logo && (
                <img
                  src={payee_logo}
                  alt={payee_name}
                  className="transaction-payee-logo"
                />
              )}

              {payee_name && (
                <span className="transaction-payee-name">{payee_name}</span>
              )}
            </div>

            <div className="payee-actions">
              {product_link && (
                <a
                  href={product_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title="Product Link"
                  className="action-link product-link"
                >
                  <FaExternalLinkAlt size={14} />
                </a>
              )}

              {googleMapsLink && (
                <a
                  href={googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title="Open Location"
                  className="action-link map-link"
                >
                  <FaLocationDot size={16} />
                </a>
              )}
            </div>
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
