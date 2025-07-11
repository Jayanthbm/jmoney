// src/components/Views/IncomeExpenseView.jsx

import { AnimatePresence, motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FaChartBar, FaEyeSlash } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import {
  formatIndianNumber,
  getMonthOptions,
  groupAndSortTransactions,
} from "../../utils";

import Button from "../Button/Button";
import InlineLoader from "../Loader/InlineLoader";
import MonthYearSelector from "./MonthYearSelector";
import NoDataCard from "../Cards/NoDataCard";
import TransactionCard from "../Cards/TransactionCard";
import TransactionsMode from "./TransactionsMode";
import { getAllTransactions } from "../../db/transactionDb";
import { useMediaQuery } from "react-responsive";
import useTheme from "../../hooks/useTheme";

const IncomeExpenseView = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
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

  const [transactions, setTransactions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryAmount, setSelectedCategoryAmount] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [showChart, setShowChart] = useState(true);

  const [showExpenseList, setShowExpenseList] = useState(true);
  const [showIncomeList, setShowIncomeList] = useState(true);

  useEffect(() => {
    if (isMobile) {
      setShowChart(false);
    }
  }, [isMobile]);

  useEffect(() => {
    const fetchAndSummarize = async () => {
      setLoading(true);
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
      setLoading(false);
    };

    fetchAndSummarize();
  }, [month, year]);

  const handleBack = () => {
    setViewMode("summary");
    setTransactions([]);
  };

  return (
    <>
      {viewMode === "summary" && (
        <>
          {/* Month/Year Selectors */}
          <MonthYearSelector
            yearValue={year}
            onYearChange={(opt) => setYear(opt)}
            monthValue={month}
            onMonthChange={(opt) => setMonth(opt)}
            disabled={loading}
          />
          {!loading && (
            <div className="align-right">
              <Button text={
                isMobile ? null : showChart ? "Hide Chart" : "Show Chart"
              } onClick={() => {
                setShowChart(!showChart)
              }}
                icon={showChart ? <FaEyeSlash /> : <FaChartBar />}
              />
            </div>
          )}

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

          {loading ? (
            <InlineLoader />
          ) : expenseSummary?.length === 0 ? (
            <NoDataCard message="No expenses found" height="100" width="150" />
          ) : (
            <>
              {/* Category Summary */}
              <div className="date-summary-bar">
                <div className="summary-date" onClick={() => {
                  setShowExpenseList(!showExpenseList)
                }} style={{ cursor: 'pointer' }}>Expense</div>
                <div className="summary-amount">
                  {formatIndianNumber(totalExpense)}
                </div>
              </div>
              <AnimatePresence>
                {showExpenseList && (
                  <motion.div
                    className="transaction-card-list"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {expenseSummary?.map((category, index) => {
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
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {loading ? (
            <></>
          ) : incomeSummary.length === 0 ? (
            <NoDataCard message="No income found" height="100" width="150" />
          ) : (
            <>
              <div className="date-summary-bar">
                <div className="summary-date" onClick={() => {
                  setShowIncomeList(!showIncomeList)
                }} style={{ cursor: 'pointer' }}>Income</div>
                <div className="summary-amount">
                  {formatIndianNumber(totalIncome)}
                </div>
              </div>
              <AnimatePresence>
                {showIncomeList && (
                  <motion.div
                    className="transaction-card-list"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {incomeSummary?.map((category, index) => {
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
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </>
      )}

      {viewMode === "transactions" && (
        <TransactionsMode
          handleBack={handleBack}
          name={selectedCategory}
          amount={selectedCategoryAmount}
          transactions={transactions}
        />
      )}
    </>
  );
};

export default IncomeExpenseView;
