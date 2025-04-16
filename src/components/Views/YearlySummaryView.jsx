// src/components/Views/YearlySummaryView.jsx

import React, { useEffect, useState } from "react";
import Select from "react-select";
import OverviewCard from "../Cards/OverviewCard";
import MyCountUp from "../Charts/MyCountUp";
import ProgressBar from "../Charts/ProgressBar";
import { getAllTransactions } from "../../db/transactionDb";
import { formatIndianNumber, getYearOptions } from "../../utils";
import "./YearlySummaryView.css";

const YearlySummaryView = () => {
  const [year, setYear] = useState({
    value: new Date().getFullYear(),
    label: new Date().getFullYear().toString(),
  });
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);

  useEffect(() => {
    const fetchAndSummarize = async () => {
      const allTx = await getAllTransactions();
      if (!year) return;

      const selectedYear = parseInt(year.value);
      const filtered = allTx.filter((tx) => {
        const txDate = new Date(tx.transaction_timestamp);
        return txDate.getFullYear() === selectedYear;
      });

      const incomeTotal = filtered
        .filter((tx) => tx.type === "Income")
        .reduce((sum, tx) => sum + tx.amount, 0);

      const expenseTotal = filtered
        .filter((tx) => tx.type === "Expense")
        .reduce((sum, tx) => sum + tx.amount, 0);

      setIncome(incomeTotal);
      setExpense(expenseTotal);
    };

    fetchAndSummarize();
  }, [year]);

  const expensePercent =
    income > 0 ? Math.min((expense / income) * 100, 100) : 0;

  return (
    <div className="yearly-summary-view">
      <div className="sub-section-heading">Yearly Summary</div>

      <Select
        className="react-select-container"
        classNamePrefix="react-select"
        options={getYearOptions()}
        value={year}
        onChange={(opt) => setYear(opt)}
        placeholder="Select a year"
      />

      <OverviewCard title={`Income vs Expense | ${year.label}`}>
        <div className="summary-line">
          <div className="summary-label">Total Income</div>
          <div className="yearly-summary-amount income-text">
            <MyCountUp end={income} />
          </div>
          <ProgressBar value={100} color="#3ecf8e" height="18px" />
        </div>
        <div className="summary-line">
          <div className="summary-label">Total Expense</div>
          <div className="yearly-summary-amount expense-text">
            <MyCountUp end={expense} />
          </div>
          <ProgressBar value={expensePercent} color="#ef4444" height="18px" />
          <div className="yearly-summary-expense-summary">
            {income < expense ? (
              <div className="summary-box overspent">
                <div className="summary-label">
                  <span
                    className="summary-icon"
                    style={{
                      fontSize: "2rem",
                      color: "#ef4444",
                    }}
                  >
                    ⚠︎
                  </span>
                  Overspent
                </div>
                <div className="summary-value expense-text">
                  {formatIndianNumber(Number((expense - income).toFixed(2)))}
                </div>
              </div>
            ) : (
              <>
                <div className="summary-box saved">
                  <div className="summary-label">
                    <span className="summary-icon">💰</span>Saved
                  </div>
                  <div className="summary-value">
                    {formatIndianNumber(Number((income - expense).toFixed(2)))}
                  </div>
                </div>
                <div className="summary-box spent">
                  <div className="summary-label">
                    <span className="summary-icon">💸</span> Spent
                  </div>
                  <div className="summary-value">
                    {expensePercent.toFixed(2)}%
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </OverviewCard>
    </div>
  );
};

export default YearlySummaryView;
