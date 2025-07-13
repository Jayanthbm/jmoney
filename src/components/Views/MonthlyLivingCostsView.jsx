// src/components/Views/MonthlyLivingCostsView.jsx

import React, { useEffect, useState } from "react";
import { formatIndianNumber, getCategoryCachekeys, getMonthOptions, groupAndSortTransactions } from "../../utils";
import { get, set } from "idb-keyval";

import Button from "../Button/Button";
import { FaEdit } from "react-icons/fa";
import { FiSave } from "react-icons/fi";
import InlineLoader from "../Loader/InlineLoader";
import MonthYearSelector from "./MonthYearSelector";
import MySelect from "../Select/MySelect";
import NoDataCard from "../Cards/NoDataCard";
import TransactionCard from "../Cards/TransactionCard";
import TransactionsMode from "./TransactionsMode";
import { getAllTransactions } from "../../db/transactionDb";
import useDetectBack from "../../hooks/useDetectBack";
import { useMediaQuery } from "react-responsive";

const { EXPENSE_CACHE_KEY, CHOOSEN_CATEGORIES_CACHE_KEY } = getCategoryCachekeys();

const MonthlyLivingCostsView = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const [month, setMonth] = useState({
    value: new Date().getMonth(),
    label: getMonthOptions()[new Date().getMonth()].label,
  });

  const [year, setYear] = useState({
    value: new Date().getFullYear(),
    label: new Date().getFullYear().toString(),
  });
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [choosenCategories, setChoosenCategories] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [summary, setSummary] = useState([]);
  const [totalSummary, setTotalSummary] = useState(0);
  const [viewMode, setViewMode] = useState("summary");
  const [heading, setHeading] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryAmount, setSelectedCategoryAmount] = useState(0);


  useEffect(() => {
    const init = async () => {
      const cached_categories = await get(EXPENSE_CACHE_KEY);
      setExpenseCategories(cached_categories);

      const cached_choosen_category_ids = await get(CHOOSEN_CATEGORIES_CACHE_KEY);
      if (!cached_choosen_category_ids || cached_choosen_category_ids.length === 0) {
        setHeading("Configure Categories");
        setViewMode("configure");
      } else {
        setChoosenCategories(cached_choosen_category_ids);
        const selected = cached_categories
          .filter((cat) => cached_choosen_category_ids.includes(cat.id))
          ?.map((cat) => ({ value: cat.id, label: cat.name }));
        setSelectedOptions(selected);
      }
      setInitializing(false);
    };
    init();
  }, []);

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
      if (choosenCategories && choosenCategories?.length > 0) {

        const categoriesFiltered = filtered.filter(
          (tx) => tx.type === "Expense" && choosenCategories.includes(tx.category_id)
        );

        const total = categoriesFiltered.reduce((sum, tx) => sum + tx.amount, 0);
        setTotalSummary(total);

        let summaryMap = {};
        categoriesFiltered.forEach((tx) => {
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
          ?.map(([category, data]) => ({
            category_name: category,
            category_icon: data.icon,
            amount: data.amount,
            percentage: total > 0 ? Math.round((data.amount / total) * 100) : 0,
            type: "Expense",
            transactions: data.transactions,
          }))
          .sort((a, b) => b.amount - a.amount);
        setSummary(summaryArray);
      } else {
        setSummary([]);
        setTotalSummary(0);
      }

      setLoading(false);
    };
    if (initializing) return;
    fetchAndSummarize();
  }, [month, year, choosenCategories, initializing]);


  const handleSaveCategories = async () => {
    const selectedIds = selectedOptions?.map((opt) => opt.value);
    await set(CHOOSEN_CATEGORIES_CACHE_KEY, selectedIds);
    setChoosenCategories(selectedIds);
    setHeading(null);
    setViewMode("summary");
  };

  const categoryOptions = expenseCategories?.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  const handleBack = () => {
    setViewMode("summary");
    setHeading(null);
    setTransactions([]);
    sessionStorage.setItem('transactionsViewMode', JSON.stringify(false));
  };

  useDetectBack(viewMode !== "summary", handleBack);

  useEffect(() => {
    if (viewMode === 'summary') {
      setTimeout(() => {
        sessionStorage.setItem('transactionsViewMode', JSON.stringify(false));
      }, 100)
    }
  }, [viewMode]);


  return (
    <div>
      {heading && (
        <div className="sub-section-heading">{heading}</div>
      )}
      {viewMode === "configure" && (
        <>
          <div style={{
            marginBottom: '1rem'
          }}>
            <MySelect
              isMulti
              options={categoryOptions}
              value={selectedOptions}
              onChange={setSelectedOptions}
              placeholder="Select categories to track"
            />
          </div>
          <Button icon={<FiSave />} variant="success" onClick={handleSaveCategories} text="Save Categories" disabled={selectedOptions.length === 0} />
        </>
      )}
      {viewMode === "summary" && (
        <>
          <div className="align-right">
            <Button
              icon={<FaEdit />}
              onClick={() => {
                setHeading("Configure Categories");
                setViewMode("configure");
                const selected = expenseCategories
                  .filter((cat) => choosenCategories.includes(cat.id))
                  ?.map((cat) => ({ value: cat.id, label: cat.name }));
                setSelectedOptions(selected);
                sessionStorage.setItem('transactionsViewMode', JSON.stringify(true));
              }}
              text={isMobile ? null : "Edit Configuration"}
            />

          </div>

          {/* Month/Year Selectors */}
          <MonthYearSelector
            yearValue={year}
            onYearChange={(opt) => setYear(opt)}
            monthValue={month}
            onMonthChange={(opt) => setMonth(opt)}
            disabled={loading}
          />

          {/* Category Summary */}
          <div className="date-summary-bar">
            <div className="summary-date">Expense</div>
            <div className="summary-amount">
              {formatIndianNumber(totalSummary)}
            </div>
          </div>
          {initializing || loading ? (
            <InlineLoader />
          ) : summary.length === 0 ? (
            <NoDataCard message="No transactions found" height="100" width="150" />
          ) : (
            <div className="transaction-card-list">
              {summary?.map((category, index) => {
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
                      sessionStorage.setItem('transactionsViewMode', JSON.stringify(true));
                    }}
                  />
                );
              })}
            </div>
          )}
        </>
      )}
      {viewMode === "transactions" && (
        <TransactionsMode
          name={selectedCategory}
          amount={selectedCategoryAmount}
          transactions={transactions}
        />
      )}
    </div>
  );
};

export default MonthlyLivingCostsView;
