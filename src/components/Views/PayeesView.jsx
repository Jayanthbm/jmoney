// src/components/Views/PayeesView.jsx

import "./PayeesView.css";

import React, { useEffect, useState } from "react";
import { formatDateToDayMonthYear, formatIndianNumber } from "../../utils";

import { IoIosArrowBack } from "react-icons/io";
import Loading from "../Layouts/Loading";
import TransactionCard from "../Cards/TransactionCard";
import { getAllTransactions } from "../../db/transactionDb";
import { groupBy } from "lodash";

const PayeesView = () => {
  const [loading, setLoading] = useState(true);
  const [heading, setHeading] = useState(null);
  const [viewMode, setViewMode] = useState("summary");
  const [groupedPayees, setGroupedPayees] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedPayee, setSelectedPayee] = useState(null);
  const [selectedPayeeTotal, setSelectedPayeeTotal] = useState(0);

  useEffect(() => {
    const fetchAndSummarize = async () => {
      setLoading(true);
      const allTx = await getAllTransactions();
      const filtered = allTx.filter((tx) => tx.payee_name);
      const grouped = groupBy(filtered, (tx) => tx.payee_name);

      const summarizedPayees = Object.entries(grouped)?.map(
        ([payeeName, txs]) => {
          const amount = txs.reduce((sum, tx) => {
            return tx.type === "Income" ? sum + tx.amount : sum - tx.amount;
          }, 0);

          return {
            name: payeeName,
            amount,
            transactions: txs,
          };
        }
      );

      // 🔠 Sort alphabetically by payee name
      summarizedPayees.sort((a, b) => a.name.localeCompare(b.name));

      setGroupedPayees(summarizedPayees);
      setLoading(false);
    };
    fetchAndSummarize();
  }, [setLoading]);

  const handlePayeeClick = (payee) => {
    const sorted = payee.transactions.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    const groupedByDate = groupBy(sorted, "date");
    setSelectedPayee(payee.name);
    setSelectedPayeeTotal(payee.amount);
    setTransactions(groupedByDate);
    setViewMode("transactions");
    setHeading(`${payee.name} Transactions`);
  };

  return (
    <div>
      {heading && (
        <div className="sub-section-heading">{heading}</div>
      )}
      {loading ? (
        <Loading />
      ) : (
        <>
          {viewMode === "summary" && (
            <>
              <div className="payee-summary-wrapper">
                {groupedPayees?.map((payee) => (
                  <div
                    key={payee.name}
                    className="payee-summary-card"
                    onClick={() => handlePayeeClick(payee)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        handlePayeeClick(payee);
                    }}
                  >
                    <div className="payee-details">
                      <div className="payee-name">{payee.name}</div>
                      <div
                        className={`payee-amount ${
                          payee.amount >= 0 ? "green-text" : "red-text"
                        }`}
                      >
                        {payee.amount < 0 ? "-" : ""}
                        {formatIndianNumber(Math.abs(payee.amount))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {viewMode === "transactions" && (
            <>
              <div
                className="back-button-container"
                role="button"
                tabIndex={0}
                onClick={() => {
                  setViewMode("summary");
                  setHeading(null);
                  setTransactions([]);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setViewMode("summary");
                    setHeading(null);
                    setTransactions([]);
                  }
                }}
              >
                <IoIosArrowBack />
                <span className="back-button">Summary</span>
              </div>
              <div className="date-summary-bar">
                <div className="summary-date">{selectedPayee}</div>
                <div className="summary-amount">
                  {formatIndianNumber(selectedPayeeTotal)}
                </div>
              </div>
              <div className="transaction-page-wrapper">
                {Object.entries(transactions)?.map(([date, items]) => (
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
            </>
          )}
        </>
      )}
    </div>
  );
};

export default PayeesView;
