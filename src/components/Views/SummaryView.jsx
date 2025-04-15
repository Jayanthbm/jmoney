// src/components/Views/SummaryView.jsx

import React, { useEffect, useState } from "react";
import Select from "react-select";
import DonutChart from "../Charts/DonutChart";
import TransactionCard from "../Cards/TransactionCard";
import { getAllTransactions } from "../../db";
import {
  getMonthOptions,
  getTopCategoryColors,
  getYearOptions,
} from "../../utils";

const SummaryView = ({ title = "Top Categories", showMonthSelect = true }) => {
  const [type, setType] = useState("Expense");
  const [month, setMonth] = useState({
    value: new Date().getMonth(),
    label: getMonthOptions()[new Date().getMonth()].label,
  });
  const [year, setYear] = useState({
    value: new Date().getFullYear(),
    label: new Date().getFullYear().toString(),
  });
  const [categorySummary, setCategorySummary] = useState([]);

  useEffect(() => {
    const fetchAndSummarize = async () => {
      const allTx = await getAllTransactions();

      let filtered;
      if (showMonthSelect) {
        filtered = allTx.filter((tx) => {
          const date = new Date(tx.date);
          return (
            tx.type === type &&
            date.getMonth() === month.value &&
            date.getFullYear() === year.value
          );
        });
      } else {
        filtered = allTx.filter((tx) => {
          const date = new Date(tx.date);
          return tx.type === type && date.getFullYear() === year.value;
        });
      }

      const total = filtered.reduce((sum, tx) => sum + tx.amount, 0);

      const summaryMap = {};
      filtered.forEach((tx) => {
        if (!summaryMap[tx.category_name]) {
          summaryMap[tx.category_name] = {
            amount: 0,
            icon: tx.category_icon, // fallback handled in component
          };
        }
        summaryMap[tx.category_name].amount += tx.amount;
      });

      const summaryArray = Object.entries(summaryMap)
        .map(([category, data]) => ({
          category_name: category,
          category_icon: data.icon,
          amount: data.amount,
          percentage: Math.round((data.amount / total) * 100),
          type: type,
        }))
        .sort((a, b) => b.percentage - a.percentage);

      setCategorySummary(summaryArray);
    };

    fetchAndSummarize();
  }, [type, month, year, showMonthSelect]);

  return (
    <div>
      <div className="sub-section-heading">{title}</div>

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
      <div className="filters-wrapper">
        {showMonthSelect && (
          <Select
            className="react-select-container"
            classNamePrefix="react-select"
            options={getMonthOptions()}
            value={month}
            onChange={(opt) => setMonth(opt)}
          />
        )}

        <Select
          className="react-select-container"
          classNamePrefix="react-select"
          options={getYearOptions()}
          value={year}
          onChange={(opt) => setYear(opt)}
        />
      </div>

      {/* Category Summary */}
      <>
        {categorySummary.length === 0 ? (
          <div className="no-data-card">No data found</div>
        ) : (
          <>
            {/* Donut Chart */}
            <DonutChart
              data={categorySummary?.map((cat) => ({
                value: cat?.percentage,
                name: cat?.category_name,
              }))}
              colors={getTopCategoryColors(categorySummary.length)}
            />
            <div className="transaction-card-list">
              {categorySummary?.map((category, index) => {
                return <TransactionCard key={index} transaction={category} />;
              })}
            </div>
          </>
        )}
      </>
    </div>
  );
};

export default SummaryView;
