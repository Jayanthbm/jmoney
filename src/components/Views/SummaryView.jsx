// src/components/Views/SummaryView.jsx

import { FaChartBar, FaEyeSlash } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import {
  getMonthOptions,
  getTopCategoryColors,
  groupAndSortTransactions,
} from "../../utils";

import Button from "../Button/Button";
import DonutChart from "../Charts/DonutChart";
import NoDataCard from "../Cards/NoDataCard";
import TransactionCard from "../Cards/TransactionCard";
import { getAllTransactions } from "../../db/transactionDb";
import { useMediaQuery } from "react-responsive";
import InlineLoader from "../Layouts/InlineLoader";
import TransactionsMode from "./TransactionsMode";
import MonthYearSelector from "./ MonthYearSelector";

const SummaryView = ({ title, showMonthSelect = true }) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
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
  const [categorySummary, setCategorySummary] = useState([]);
  const [viewMode, setViewMode] = useState("summary");

  const [transactions, setTransactions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryAmount, setSelectedCategoryAmount] = useState(0);
  const [showSummaryChart, setShowSummaryChart] = useState(true);

  useEffect(() => {
    if (isMobile) {
      setShowSummaryChart(false);
    }
  }, [isMobile]);


  useEffect(() => {
    const fetchAndSummarize = async () => {
      setLoading(true);
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
      setLoading(false);
    };

    fetchAndSummarize();
  }, [type, month, year, showMonthSelect]);


  const handleBack = () => {
    setViewMode("summary");
    setTransactions({});
  };

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
            showMonth={showMonthSelect}
          />

          {/* Category Summary */}
          <>
            {loading ? (
              <InlineLoader text="Loading Categories" />
            ) : categorySummary?.length === 0 ? (
              <NoDataCard message="No transactions" height="150" width="200" />
            ) : (
              <>
                <div className="align-right">
                  <Button text={
                    isMobile ? null : showSummaryChart ? "Hide Chart" : "Show Chart"
                  } onClick={() => {
                    setShowSummaryChart(!showSummaryChart)
                  }}
                    icon={showSummaryChart ? <FaEyeSlash /> : <FaChartBar />}
                  />
                </div>
                {showSummaryChart && (
                  <>
                    {/* Donut Chart */}
                    <DonutChart
                      data={categorySummary?.map((cat) => ({
                        value: cat?.percentage,
                        name: cat?.category_name,
                      }))}
                      colors={getTopCategoryColors(categorySummary.length)}
                    />
                  </>
                )}

                <div className="transaction-card-list">
                  {categorySummary?.map((category, index) => {
                    return (
                      <TransactionCard
                        key={index}
                        transaction={category}
                        onCardClick={() => {
                          setViewMode("transactions");
                          setTransactions(
                            groupAndSortTransactions(category.transactions)
                          );
                          setSelectedCategory(category.category_name);
                          setSelectedCategoryAmount(category.amount);
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
        <TransactionsMode
          name={selectedCategory}
          amount={selectedCategoryAmount}
          handleBack={handleBack}
          transactions={transactions}
        />
      )}
    </>
  );
};

export default SummaryView;
