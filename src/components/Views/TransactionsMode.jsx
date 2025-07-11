// src/components/Views/TransactionsMode.jsx

import { formatDateToDayMonthYear, formatIndianNumber } from "../../utils";

import React from "react";
import TransactionCard from "../Cards/TransactionCard";

const TransactionsMode = ({ name, amount, transactions }) => {
  return (
    <>
      <div className="date-summary-bar">
        <div style={{ display: 'flex' }}>
          {name ? (
            <div className="summary-date">
              {name}
            </div>
          ) : (<></>)}
        </div>
        {amount ? (
          <div className="summary-amount">
            {formatIndianNumber(amount)}
          </div>
        ) : (<></>)}
      </div>
      {transactions && (
        <div className="transaction-page-wrapper">
          {Object?.entries(transactions)?.map(([date, items]) => (
            <div key={date} className="transaction-group">
              <h2 className="transaction-date-header">
                {formatDateToDayMonthYear(date)}
              </h2>
              <div className="transaction-card-list">
                {items?.map((tx) => (
                  <TransactionCard key={tx.id} transaction={tx} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    </>

  )
}

export default TransactionsMode;