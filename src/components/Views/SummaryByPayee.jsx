import React, { useEffect, useState } from "react";
import { formatIndianNumber, getMonthOptions, groupAndSortTransactions } from "../../utils";

import InlineLoader from "../Loader/InlineLoader";
import MonthYearSelector from "./MonthYearSelector";
import NoDataCard from "../Cards/NoDataCard";
import TransactionsMode from "./TransactionsMode";
import { getAllTransactions } from "../../db/transactionDb";
import useDetectBack from "../../hooks/useDetectBack";

const SummaryByPayee = () => {
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("Expense");
  const [month, setMonth] = useState({
    value: new Date().getMonth(),
    label: getMonthOptions()[new Date().getMonth()].label,
  });
  const [year, setYear] = useState({
    value: new Date().getFullYear(),
    label: new Date().getFullYear().toString(),
  });
  const [payeeSummary, setPayeeSummary] = useState([]);
  const [viewMode, setViewMode] = useState("summary");
  const [transactions, setTransactions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(0);

  useEffect(() => {
    const fetchAndSummarize = async () => {
      setLoading(true);

      const allTx = await getAllTransactions();
      let filtered = allTx.filter((tx) => {
        const date = new Date(tx.date);
        return (
          tx.payee_id !== null &&
          tx.type === type &&
          date.getMonth() === month.value &&
          date.getFullYear() === year.value
        );
      });

      const total = filtered.reduce((sum, tx) => sum + tx.amount, 0);

      const summaryMap = {};

      filtered.forEach((tx) => {
        if (!summaryMap[tx.payee_name]) {
          summaryMap[tx.payee_name] = {
            amount: 0,
            icon: "",
            transactions: [],
          };
        }
        summaryMap[tx.payee_name].amount += tx.amount;
        summaryMap[tx.payee_name].transactions.push(tx);
      });

      const summaryArray = Object.entries(summaryMap)
        .map(([payee, data]) => ({
          name: payee,
          amount: data.amount,
          percentage: Math.round((data.amount / total) * 100),
          type: type,
          transactions: data.transactions,
        }))
        .sort((a, b) => b.amount - a.amount);

      setPayeeSummary(summaryArray);
      setLoading(false);
    }
    fetchAndSummarize();
  }, [type, month, year])

  const handleBack = () => {
    setViewMode("summary");
    setTransactions({});
    sessionStorage.setItem('transactionsViewMode', JSON.stringify(false));
  };

  useDetectBack(viewMode !== "summary", handleBack);

  return (
    <>
      {viewMode === "summary" && (
        <>
          {/* Toggle Buttons */}
          <div className="toggle-button-group">
            <button
              onClick={() => setType("Expense")}
              className={type === "Expense" ? "active" : ""}
            >
              Expense
            </button>
            <button
              onClick={() => setType("Income")}
              className={type === "Income" ? "active" : ""}
            >
              Income
            </button>
          </div>

          {/* Month/Year Selectors */}
          <MonthYearSelector
            yearValue={year}
            onYearChange={(opt) => setYear(opt)}
            monthValue={month}
            onMonthChange={(opt) => setMonth(opt)}
            disabled={loading}
          />

          {/* Payee Summary */}
          <>
            {loading ? (
              <InlineLoader text="Loading Payees" />
            ) : payeeSummary?.length === 0 ? (
              <NoDataCard message="No transactions" height="150" width="200" />
            ) : (
              <div className="payee-summary-wrapper">
                {payeeSummary?.map((payee) => (
                  <div
                    key={payee.name}
                    className="payee-summary-card"
                    onClick={() => {
                      setTransactions(
                        groupAndSortTransactions(payee.transactions)
                      );
                      setViewMode("transactions");
                      setSelected(payee.name);
                      setSelectedAmount(payee.amount);
                      sessionStorage.setItem('transactionsViewMode', JSON.stringify(true));
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="payee-details">
                      <div className="payee-name">{payee.name}</div>
                      <div style={{
                        display: "flex",
                        flexDirection: 'column',
                        alignItems: 'flex-end'

                      }}>
                        <div
                          className={`payee-amount ${type === "Income" ? "green-text" : "red-text"
                            }`}
                        >
                          {formatIndianNumber(Math.abs(payee.amount))}

                        </div>
                        <div className="transaction-percentage">{payee.percentage}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        </>
      )}

      {viewMode === "transactions" && (
        <TransactionsMode
          name={selected}
          amount={selectedAmount}
          handleBack={handleBack}
          transactions={transactions}
        />
      )}
    </>
  )
}

export default SummaryByPayee;