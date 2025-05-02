// src/components/Views/MonthlyLivingCostsView.jsx

import React, { useEffect, useState } from "react";

import { useMediaQuery } from "react-responsive";
import Select from "react-select";
import { groupBy } from "lodash";
import { formatDateToDayMonthYear, formatIndianNumber, getMonthOptions, getSupabaseUserIdFromLocalStorage, getYearOptions } from "../../utils";
import { getAllTransactions } from "../../db/transactionDb";
import TransactionCard from "../Cards/TransactionCard";
import { IoIosArrowBack } from "react-icons/io";
import { get, set } from "idb-keyval";
import Button from "../Button/Button";
import { FiSave } from "react-icons/fi";
import { FaEdit } from "react-icons/fa";
import NoDataCard from "../Cards/NoDataCard";

const MonthlyLivingCostsView = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

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
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const init = async () => {
      const userId = getSupabaseUserIdFromLocalStorage();
      setUserId(userId);
      const cached_categories = await get(`${userId}_settings-expense-categories`);
      setExpenseCategories(cached_categories);

      const cached_choosen_category_ids = await get(`${userId}_choosen_category_ids`);
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
    };
    init();
  }, []);

  useEffect(() => {
    const fetchAndSummarize = async () => {
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
            percentage: Math.round((data.amount / total) * 100),
            type: "Expense",
            transactions: data.transactions,
          }))
          .sort((a, b) => b.percentage - a.percentage);
        setSummary(summaryArray);

      }
    }
    if (choosenCategories?.length > 0) {
      fetchAndSummarize();
    }

  }, [month, year, choosenCategories])

  const handleSaveCategories = async () => {
    const selectedIds = selectedOptions?.map((opt) => opt.value);
    await set(`${userId}_choosen_category_ids`, selectedIds);
    setChoosenCategories(selectedIds);
    setHeading("Monthly Living Costs");
    setViewMode("summary");
  };

  const categoryOptions = expenseCategories?.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

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
            <Select
              isMulti
              options={categoryOptions}
              value={selectedOptions}
              onChange={setSelectedOptions}
              classNamePrefix="react-select"
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
              }}
              text={isMobile ? null : "Edit Configuration"}
            />

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

            <Select
              className="react-select-container"
              classNamePrefix="react-select"
              options={getMonthOptions()}
              value={month}
              onChange={(opt) => setMonth(opt)}
            />
          </div>

          {/* Category Summary */}
          <div className="date-summary-bar">
            <div className="summary-date">Expense</div>
            <div className="summary-amount">
              {formatIndianNumber(totalSummary)}
            </div>
          </div>
          {summary?.length === 0 && (<NoDataCard message="No transactions found" height="100" width="150" />)}
          <div className="transaction-card-list">
            {summary?.map((category, index) => {
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

export default MonthlyLivingCostsView;
