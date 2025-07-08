// src/pages/Transactions/GroupedTransactions.jsx

import React from "react";
import TransactionCard from "../../components/Cards/TransactionCard";
import { formatDateToDayMonthYear } from "../../utils";

const GroupedTransactions = ({ grouped, onTransactionClick, fadeOut }) => (
  <div className={`transaction-page-wrapper ${fadeOut ? "fade-out" : ""}`}>
    {Object.entries(grouped).map(([date, items]) => (
      <div key={date} className="transaction-group">
        <h2 className="transaction-date-header">{formatDateToDayMonthYear(date)}</h2>
        <div className="transaction-card-list">
          {items.map((tx) => (
            <TransactionCard
              key={tx.id}
              transaction={tx}
              onCardClick={() => onTransactionClick(tx)}
            />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default React.memo(GroupedTransactions);
