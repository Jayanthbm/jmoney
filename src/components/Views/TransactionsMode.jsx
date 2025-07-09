// src/components/Views/TransactionsMode.jsx

import React from "react";
import { IoIosArrowBack } from "react-icons/io";
import { formatDateToDayMonthYear, formatIndianNumber } from "../../utils";
import TransactionCard from "../Cards/TransactionCard";

const TransactionsMode = ({ handleBack, name, amount, transactions }) => {
  return (
    <>
      <div className="date-summary-bar" style={{ cursor: 'pointer' }} onClick={handleBack}>
        <div style={{ display: 'flex' }}>
          <IoIosArrowBack />
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