// src/components/Views/IncomeExpenseView.jsx

import React, { useEffect, useState } from "react";
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
import {
  formatIndianNumber,
  getMonthOptions,
  getYearOptions,
} from "../../utils";
import Select from "react-select";
import { getAllTransactions } from "../../db/transactionDb";
import TransactionCard from "../Cards/TransactionCard";
import { IoIosArrowBack } from "react-icons/io";

const IncomeExpenseView = () => {
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
  const [heading, setHeading] = useState("Income vs Expense");
  const [transactions, setTransactions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryAmount, setSelectedCategoryAmount] = useState(0);
  const [chartData, setChartData] = useState([]);

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
        .map(([category, data]) => ({
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
        .map(([category, data]) => ({
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
      <div className="sub-section-heading">{heading}</div>
      {/* Month/Year Selectors */}
      {viewMode === "summary" && (
        <>
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
                />
                <Legend />
                <Bar dataKey="income" fill="#3ecf8e" name="Income" />
                <Bar dataKey="expense" fill="#ef4444" name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Summary */}
          <div className="date-summary-bar">
            <div className="summary-date">Expense</div>
            <div className="summary-amount">
              {formatIndianNumber(totalExpense)}
            </div>
          </div>
          <div className="transaction-card-list">
            {expenseSummary?.map((category, index) => {
              return (
                <TransactionCard
                  key={index}
                  transaction={category}
                  onCardClick={() => {
                    setViewMode("transactions");
                    setHeading("Transactions");
                    setTransactions(category.transactions);
                    setSelectedCategory(category.category_name);
                    setSelectedCategoryAmount(category.amount);
                  }}
                />
              );
            })}
          </div>

          <div className="date-summary-bar">
            <div className="summary-date">Income</div>
            <div className="summary-amount">
              {formatIndianNumber(totalIncome)}
            </div>
          </div>
          <div className="transaction-card-list">
            {incomeSummary?.map((category, index) => {
              return (
                <TransactionCard
                  key={index}
                  transaction={category}
                  onCardClick={() => {
                    setViewMode("transactions");
                    setHeading("Transactions");
                    setTransactions(category.transactions);
                    setSelectedCategory(category.category_name);
                    setSelectedCategoryAmount(category.amount);
                  }}
                />
              );
            })}
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
              setHeading("Income Vs Expense");
              setTransactions([]);
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
          <div className="transaction-card-list">
            {transactions?.map((tx, index) => (
              <TransactionCard key={index} transaction={tx} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default IncomeExpenseView;
