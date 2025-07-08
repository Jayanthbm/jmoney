// src/components/Views/SummaryView.jsx

import { FaChartBar, FaEyeSlash } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import {
  formatDateToDayMonthYear,
  formatIndianNumber,
  getMonthOptions,
  getTopCategoryColors,
  getYearOptions,
} from "../../utils";

import Button from "../Button/Button";
import DonutChart from "../Charts/DonutChart";
import { IoIosArrowBack } from "react-icons/io";
import NoDataCard from "../Cards/NoDataCard";
import Select from "react-select";
import TransactionCard from "../Cards/TransactionCard";
import { getAllTransactions } from "../../db/transactionDb";
import { groupBy } from "lodash";
import { useMediaQuery } from "react-responsive";
import InlineLoader from "../Layouts/InlineLoader";

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
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [viewMode, setViewMode] = useState("summary");
  const [heading, setHeading] = useState(title);

  const [transactions, setTransactions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryAmount, setSelectedCategoryAmount] = useState(0);
  const [showSummaryChart, setShowSummaryChart] = useState(true);
  const [showTransactionChart, setShowTransactionChart] = useState(true);

  useEffect(() => {
    if (isMobile) {
      setShowSummaryChart(false);
      setShowTransactionChart(false);
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
      {heading && (
        <div className="sub-section-heading">{heading}</div>
      )}
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
            <Select
              className="react-select-container"
              classNamePrefix="react-select"
              options={getYearOptions()}
              value={year}
              onChange={(opt) => setYear(opt)}
            />

            {showMonthSelect && (
              <Select
                className="react-select-container"
                classNamePrefix="react-select"
                options={getMonthOptions()}
                value={month}
                onChange={(opt) => setMonth(opt)}
              />
            )}
          </div>

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
                          setHeading("Transactions");
                          setSelectedIndex(index);
                          let tt = groupBy(category.transactions, "date");
                          Object.keys(tt).forEach((date) => {
                            tt[date] = tt[date].sort(
                              (a, b) => new Date(b.transaction_timestamp) - new Date(a.transaction_timestamp)
                            );
                          });
                          setTransactions(
                            tt
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
        <>
          <div
            className="back-button-container"
            role="button"
            tabIndex={0}
            onClick={() => {
              setViewMode("summary");
              setHeading(title);
              setTransactions({});
              setSelectedIndex(null);
            }}
          >
            <IoIosArrowBack />
            <span className="back-button">Summary</span>
          </div>

          <>
            <div className="align-right">
              <Button text={
                isMobile ? null : showTransactionChart ? "Hide Chart" : "Show Chart"
              } onClick={() => {
                setShowTransactionChart(!showTransactionChart)
              }}
                icon={showTransactionChart ? <FaEyeSlash /> : <FaChartBar />}
              />
            </div>
            {showTransactionChart && (
              <>
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
              </>
            )}
          </>

          <div className="date-summary-bar">
            <div className="summary-date">{selectedCategory}</div>
            <div className="summary-amount">
              {formatIndianNumber(selectedCategoryAmount)}
            </div>
          </div>
          <div className="transaction-page-wrapper">
            {Object.entries(transactions).map(([date, items]) => (
              <div key={date} className="transaction-group">
                <h2 className="transaction-date-header">
                  {formatDateToDayMonthYear(date)}
                </h2>
                <div className="transaction-card-list">
                  {items.map((tx) => (
                    <TransactionCard key={tx.id} transaction={tx} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SummaryView;
