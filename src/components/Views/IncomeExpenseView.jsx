// src/components/Views/IncomeExpenseView.jsx

import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import {
  formatIndianNumber,
  getMonthOptions,
  groupAndSortTransactions,
} from "../../utils";

import AppLayout from "../Layouts/AppLayout";
import InlineLoader from "../Loader/InlineLoader";
import MonthYearSelector from "./MonthYearSelector";
import NoDataCard from "../Cards/NoDataCard";
import TransactionCard from "../Cards/TransactionCard";
import TransactionsMode from "./TransactionsMode";
import { getAllTransactions } from "../../db/transactionDb";

const IncomeExpenseView = ({ title, onBack }) => {
  const [loading, setLoading] = useState(true);
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

  const [showExpenseList, setShowExpenseList] = useState(true);
  const [showIncomeList, setShowIncomeList] = useState(true);

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
        <AppLayout title={title} onBack={onBack}>
          {/* Month/Year Selectors */}
          <MonthYearSelector
            yearValue={year}
            onYearChange={(opt) => setYear(opt)}
            monthValue={month}
            onMonthChange={(opt) => setMonth(opt)}
            disabled={loading}
          />

          {loading ? (
            <InlineLoader />
          ) : expenseSummary?.length === 0 ? (
            <NoDataCard message="No expenses found" height="100" width="150" />
          ) : (
            <>
              {/* Category Summary */}
              <div
                className="date-summary-bar"
                style={{
                  marginTop: "2rem",
                }}
              >
                <div
                  className="summary-date"
                  onClick={() => {
                    setShowExpenseList(!showExpenseList);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  Expense
                </div>
                <div className="red-text">
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
                            sessionStorage.setItem(
                              "transactionsViewMode",
                              JSON.stringify(true)
                            );
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
                <div
                  className="summary-date"
                  onClick={() => {
                    setShowIncomeList(!showIncomeList);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  Income
                </div>
                <div className="green-text">
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
        </AppLayout>
      )}

      {viewMode === "transactions" && (
        <AppLayout title={title} onBack={handleBack}>
          <TransactionsMode
            name={selectedCategory}
            amount={selectedCategoryAmount}
            transactions={transactions}
          />
        </AppLayout>
      )}
    </>
  );
};

export default IncomeExpenseView;
