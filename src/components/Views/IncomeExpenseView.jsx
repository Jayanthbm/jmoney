// src/components/Views/IncomeExpenseView.jsx

import React, {  useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import { useMediaQuery } from "react-responsive";
import { groupBy } from "lodash";
import Select from "react-select";
import { FaChartBar, FaEyeSlash } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import TransactionCard from "../Cards/TransactionCard";
import NoDataCard from "../Cards/NoDataCard";
import Button from "../Button/Button";
import { getAllTransactions } from "../../db/transactionDb";
import useTheme from "../../hooks/useTheme";
import {
  formatDateToDayMonthYear,
  formatIndianNumber,
  getMonthOptions,
  getYearOptions,
} from "../../utils";

const IncomeExpenseView = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [month, setMonth] = useState({
    value: new Date().getMonth(),
    label: getMonthOptions()[new Date().getMonth()].label,
  });

  const [year, setYear] = useState({
    value: new Date().getFullYear(),
    label: new Date().getFullYear().toString(),
  });

  const [expenseSummary, setExpenseSummary] = useState([]);
  const [incomeSummary, setIncomeSummary] = useState([]);

  const [totalExpense, setTotalExpense] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);

  const [viewMode, setViewMode] = useState("summary");
  const [heading, setHeading] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryAmount, setSelectedCategoryAmount] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [showChart, setShowChart] = useState(true);

  useEffect(() => {
    if (isMobile) {
      setShowChart(false);
    }
  }, [isMobile]);

  useEffect(() => {
    const fetchAndSummarize = async () => {
      const allTx = await getAllTransactions();
      const filtered = allTx.filter((tx) => {
        const date = new Date(tx.date);
        return (
          date.getMonth() === month.value && date.getFullYear() === year.value
        );
      });

      const expenseFiltered = filtered.filter((tx) => tx.type === "Expense");

      const expenseTotal = expenseFiltered.reduce(
        (sum, tx) => sum + tx.amount,
        0
      );
      setTotalExpense(expenseTotal);
      let expenseSummaryMap = {};
      expenseFiltered.forEach((tx) => {
        if (!expenseSummaryMap[tx.category_name]) {
          expenseSummaryMap[tx.category_name] = {
            amount: 0,
            icon: tx.category_icon,
            transactions: [],
          };
        }
        expenseSummaryMap[tx.category_name].amount += tx.amount;
        expenseSummaryMap[tx.category_name].transactions.push(tx);
      });
      const expenseSummaryArray = Object.entries(expenseSummaryMap)
        ?.map(([category, data]) => ({
          category_name: category,
          category_icon: data.icon,
          amount: data.amount,
          percentage: Math.round((data.amount / expenseTotal) * 100),
          type: "Expense",
          transactions: data.transactions,
        }))
        .sort((a, b) => b.percentage - a.percentage);
      setExpenseSummary(expenseSummaryArray);

      const incomeFiltered = filtered.filter((tx) => tx.type === "Income");
      const incomeTotal = incomeFiltered.reduce(
        (sum, tx) => sum + tx.amount,
        0
      );
      setTotalIncome(incomeTotal);
      let incomeSummaryMap = {};
      incomeFiltered.forEach((tx) => {
        if (!incomeSummaryMap[tx.category_name]) {
          incomeSummaryMap[tx.category_name] = {
            amount: 0,
            icon: tx.category_icon,
            transactions: [],
          };
        }
        incomeSummaryMap[tx.category_name].amount += tx.amount;
        incomeSummaryMap[tx.category_name].transactions.push(tx);
      });
      const incomeSummaryArray = Object.entries(incomeSummaryMap)
        ?.map(([category, data]) => ({
          category_name: category,
          category_icon: data.icon,
          amount: data.amount,
          percentage: Math.round((data.amount / incomeTotal) * 100),
          type: "Income",
          transactions: data.transactions,
        }))
        .sort((a, b) => b.percentage - a.percentage);
      setIncomeSummary(incomeSummaryArray);

      const filteredByYear = allTx.filter((tx) => {
        const date = new Date(tx.date);
        return date.getFullYear() === year.value;
      });
      // Build monthly data for bar chart (ensure all 12 months are present)
      const monthlyChartData = Array.from({ length: 12 }, (_, monthIndex) => {
        const monthIncome = filteredByYear
          .filter(
            (tx) =>
              tx.type === "Income" &&
              new Date(tx.date).getMonth() === monthIndex
          )
          .reduce((sum, tx) => sum + tx.amount, 0);

        const monthExpense = filteredByYear
          .filter(
            (tx) =>
              tx.type === "Expense" &&
              new Date(tx.date).getMonth() === monthIndex
          )
          .reduce((sum, tx) => sum + tx.amount, 0);

        return {
          full_name: getMonthOptions()[monthIndex].label,
          name: monthIndex + 1,
          income: monthIncome,
          expense: monthExpense,
        };
      });

      setChartData(monthlyChartData);
    };

    fetchAndSummarize();
  }, [month, year]);

  return (
    <div>
      {heading && (
        <div className="sub-section-heading">{heading}</div>
      )}

      {viewMode === "summary" && (
        <>
          {/* Month/Year Selectors */}
          <div className="filters-wrapper">
            <Select
              className="react-select-container"
              classNamePrefix="react-select"
              options={getYearOptions()}
              value={year}
              onChange={(opt) => setYear(opt)}
            />

            <Select
              className="react-select-container"
              classNamePrefix="react-select"
              options={getMonthOptions()}
              value={month}
              onChange={(opt) => setMonth(opt)}
            />
          </div>

          <div className="align-right">
            <Button text={
              isMobile ? null : showChart ? "Hide Chart" : "Show Chart"
            } onClick={() => {
              setShowChart(!showChart)
            }}
              icon={showChart ? <FaEyeSlash /> : <FaChartBar />}
            />
          </div>
          {showChart && (
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                  onClick={(e) => {
                    if (e?.activeLabel) {
                      const selectedMonthIndex = e.activeLabel - 1;
                      setMonth({
                        value: selectedMonthIndex,
                        label: getMonthOptions()[selectedMonthIndex].label,
                      });
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={isMobile ? "name" : "full_name"} />
                  <YAxis hide={isMobile} />
                  <Tooltip
                    formatter={(value) => formatIndianNumber(value)}
                    labelFormatter={(label) => {
                      const index = label - 1;
                      return getMonthOptions()[index]?.label || "";
                    }}
                    contentStyle={{
                      backgroundColor: theme === "dark" ? "#1f1f1f" : "#ffffff",
                      borderColor: theme === "dark" ? "#333" : "#ccc",
                      borderRadius: "6px",
                      boxShadow: "0 0 10px rgba(0,0,0,0.15)",
                    }}
                    itemStyle={{
                      color: theme === "dark" ? "#e0e0e0" : "#333",
                    }}
                    labelStyle={{
                      color: theme === "dark" ? "#cccccc" : "#000000",
                      fontWeight: "bold",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#3ecf8e" name="Income" />
                  <Bar dataKey="expense" fill="#ef4444" name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}


          {/* Category Summary */}
          <div className="date-summary-bar">
            <div className="summary-date">Expense</div>
            <div className="summary-amount">
              {formatIndianNumber(totalExpense)}
            </div>
          </div>
          {expenseSummary?.length > 0 ? (
            <div className="transaction-card-list">
              {expenseSummary?.map((category, index) => {
                return (
                  <TransactionCard
                    key={index}
                    transaction={category}
                    onCardClick={() => {
                      setViewMode("transactions");
                      setHeading("Transactions");
                      setTransactions(groupBy(category.transactions, "date"));
                      setSelectedCategory(category.category_name);
                      setSelectedCategoryAmount(category.amount);
                    }}
                  />
                );
              })}
            </div>
          ) : (<NoDataCard message="No expenses found" height="100" width="150" />)}


          <div className="date-summary-bar">
            <div className="summary-date">Income</div>
            <div className="summary-amount">
              {formatIndianNumber(totalIncome)}
            </div>
          </div>
          {incomeSummary?.length > 0 ? (
            <div className="transaction-card-list">
              {incomeSummary?.map((category, index) => {
                return (
                  <TransactionCard
                    key={index}
                    transaction={category}
                    onCardClick={() => {
                      setViewMode("transactions");
                      setHeading("Transactions");
                      setTransactions(groupBy(category.transactions, "date"));
                      setSelectedCategory(category.category_name);
                      setSelectedCategoryAmount(category.amount);
                    }}
                  />
                );
              })}
            </div>
          ) : (<NoDataCard message="No income found" height="100" width="150" />)}
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
            <div className="summary-date">{selectedCategory}</div>
            <div className="summary-amount">
              {formatIndianNumber(selectedCategoryAmount)}
            </div>
          </div>
          {Object.entries(transactions)?.length === 0 && (
            <NoDataCard message="No transactions found" height="100" width="150" />
          )}
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
    </div>
  );
};

export default IncomeExpenseView;
