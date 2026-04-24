import React from "react";
import { Card } from "./Common";
import { format } from "date-fns";
import { formatCurrency } from "../constants";

export const TransactionCard = ({ transaction }) => {
  const isExpense = transaction.type === "Expense";

  return (
    <Card className="transaction-card">
      <div className="tx-left">
        <div className="tx-icon-bg">
          {/* Placeholder for icon */}
          <div className="tx-icon">📍</div>
        </div>
        <div className="tx-details">
          <div className="tx-name">
            {transaction.payee_name || transaction.category_name}
          </div>
          <div className="tx-category">{transaction.category_name}</div>
        </div>
      </div>
      <div className="tx-right">
        <div className={`tx-amount ${isExpense ? "expense" : "income"}`}>
          {isExpense ? "-" : "+"}
          {formatCurrency(transaction.amount)}
        </div>
        <div className="tx-date">
          {format(new Date(transaction.date), "MMM dd")}
        </div>
      </div>
    </Card>
  );
};
