// src/components/Views/SummaryView.jsx

import React, { useEffect, useState } from "react";
import Select from "react-select";
import DonutChart from "../Charts/DonutChart";
import TransactionCard from "../Cards/TransactionCard";
import { getAllTransactions } from "../../db";
import {
  formatIndianNumber,
  getMonthOptions,
  getTopCategoryColors,
  getYearOptions,
} from "../../utils";
import { IoIosArrowBack } from "react-icons/io";

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
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [viewMode, setViewMode] = useState("summary");
  const [heading, setHeading] = useState(title);

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
            icon: tx.category_icon,
            transactions: [],
          };
        }
        summaryMap[tx.category_name].amount += tx.amount;
        summaryMap[tx.category_name].transactions.push(tx);
      });

      const summaryArray = Object.entries(summaryMap)
        .map(([category, data]) => ({
          category_name: category,
          category_icon: data.icon,
          amount: data.amount,
          percentage: Math.round((data.amount / total) * 100),
          type: type,
          transactions: data.transactions,
        }))
        .sort((a, b) => b.percentage - a.percentage);

      setCategorySummary(summaryArray);
    };

    fetchAndSummarize();
  }, [type, month, year, showMonthSelect]);

  const getDonutChartFormatForCategory = (transactions) => {
    const summaryMap = {};
    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i];
      let payee = tx.payee_name || "Others";
      if (!summaryMap[payee]) {
        summaryMap[payee] = {
          amount: 0,
          payee_name: payee,
        };
      }
      summaryMap[payee].amount += tx.amount;
    }

    const summaryArray = Object.entries(summaryMap)
      .map(([payee, data]) => ({
        name: payee,
        amount: data.amount,
        value: Math.round(
          (data.amount / transactions.reduce((sum, tx) => sum + tx.amount, 0)) *
            100
        ),
      }))
      .sort((a, b) => b.percentage - a.percentage);

    return summaryArray;
  };
  return (
    <div>
      <div className="sub-section-heading">{heading}</div>
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
                    return (
                      <TransactionCard
                        key={index}
                        transaction={category}
                        onCardClick={() => {
                          setSelectedIndex(index);
                          setViewMode("transactions");
                          setHeading("Transactions");
                        }}
                      />
                    );
                  })}
                </div>
              </>
            )}
          </>
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
              setHeading(title);
              setSelectedIndex(null);
            }}
          >
            <IoIosArrowBack />
            <span className="back-button">Summary</span>
          </div>
          {console.log(categorySummary[selectedIndex])}
          {/* Donut Chart */}
          <DonutChart
            data={getDonutChartFormatForCategory(
              categorySummary[selectedIndex]?.transactions
            )}
            colors={getTopCategoryColors(
              getDonutChartFormatForCategory(
                categorySummary[selectedIndex]?.transactions
              ).length
            )}
          />
          <div className="date-summary-bar">
            <div className="summary-date">
              {categorySummary[selectedIndex].category_name}
            </div>
            <div className="summary-amount">
              {formatIndianNumber(categorySummary[selectedIndex].amount)}
            </div>
          </div>
          <div className="transaction-card-list">
            {categorySummary[selectedIndex]?.transactions?.map((tx, index) => (
              <TransactionCard key={index} transaction={tx} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SummaryView;
