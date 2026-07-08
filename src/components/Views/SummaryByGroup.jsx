import React, { useEffect, useState } from "react";
import {
  formatIndianNumber,
  getMonthOptions,
  groupAndSortTransactions,
} from "../../utils";
import "./SummaryByGroup.css";

import AppLayout from "../Layouts/AppLayout";
import InlineLoader from "../Loader/InlineLoader";
import MonthYearSelector from "./MonthYearSelector";
import NoDataCard from "../Cards/NoDataCard";
import TransactionsMode from "./TransactionsMode";
import { getAllTransactions } from "../../db/transactionDb";

const SummaryByGroup = ({ title, onBack }) => {
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
  const [groupSummary, setGroupSummary] = useState([]);
  const [viewMode, setViewMode] = useState("summary"); // "summary" | "categories" | "transactions"
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupCategoriesSummary, setGroupCategoriesSummary] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedAmount, setSelectedAmount] = useState(0);

  useEffect(() => {
    const fetchAndSummarize = async () => {
      setLoading(true);

      const allTx = await getAllTransactions();
      let filtered = allTx.filter((tx) => {
        const date = new Date(tx.date);
        return (
          tx.group_id !== null &&
          tx.type === type &&
          date.getMonth() === month.value &&
          date.getFullYear() === year.value
        );
      });

      const total = filtered.reduce((sum, tx) => sum + tx.amount, 0);

      const summaryMap = {};

      filtered.forEach((tx) => {
        const gName = tx.group_name || "Unassigned Group";
        if (!summaryMap[gName]) {
          summaryMap[gName] = {
            amount: 0,
            transactions: [],
          };
        }
        summaryMap[gName].amount += tx.amount;
        summaryMap[gName].transactions.push(tx);
      });

      const summaryArray = Object.entries(summaryMap)
        .map(([group, data]) => ({
          name: group,
          amount: data.amount,
          percentage: Math.round((data.amount / total) * 100),
          type: type,
          transactions: data.transactions,
        }))
        .sort((a, b) => b.amount - a.amount);

      setGroupSummary(summaryArray);
      setLoading(false);
    };
    fetchAndSummarize();
  }, [type, month, year]);

  const handleBack = () => {
    if (viewMode === "transactions") {
      setViewMode("categories");
      setTransactions([]);
    } else if (viewMode === "categories") {
      setViewMode("summary");
      setSelectedGroup(null);
      setGroupCategoriesSummary([]);
    } else {
      onBack();
    }
  };

  const handleGroupClick = (group) => {
    const categoryMap = {};
    group.transactions.forEach((tx) => {
      const catName = tx.category_name || "Uncategorized";
      if (!categoryMap[catName]) {
        categoryMap[catName] = {
          amount: 0,
          transactions: [],
        };
      }
      categoryMap[catName].amount += tx.amount;
      categoryMap[catName].transactions.push(tx);
    });

    const categoryArray = Object.entries(categoryMap)
      .map(([cat, data]) => ({
        name: cat,
        amount: data.amount,
        percentage: Math.round((data.amount / group.amount) * 100),
        transactions: data.transactions,
      }))
      .sort((a, b) => b.amount - a.amount);

    setSelectedGroup(group);
    setGroupCategoriesSummary(categoryArray);
    setViewMode("categories");
  };

  return (
    <>
      {viewMode === "summary" && (
        <AppLayout title={title} onBack={onBack}>
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
          />

          {/* Group Summary */}
          <>
            {loading ? (
              <InlineLoader text="Loading Groups" />
            ) : groupSummary?.length === 0 ? (
              <NoDataCard
                message="No transactions in any group"
                height="150"
                width="200"
              />
            ) : (
              <div className="group-summary-wrapper">
                {groupSummary?.map((group) => (
                  <div
                    key={group.name}
                    className="group-summary-card"
                    onClick={() => handleGroupClick(group)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="group-details">
                      <div className="group-report-name">{group.name}</div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                        }}
                      >
                        <div
                          className={`group-amount ${type === "Income" ? "green-text" : "red-text"}`}
                        >
                          {formatIndianNumber(Math.abs(group.amount))}
                        </div>
                        <div className="transaction-percentage">
                          {group.percentage}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        </AppLayout>
      )}

      {viewMode === "categories" && selectedGroup && (
        <AppLayout
          title={`${title}: ${selectedGroup.name}`}
          onBack={handleBack}
        >
          <div className="group-summary-wrapper">
            <div
              style={{
                padding: "0 0 16px 0",
                fontSize: "14px",
                fontWeight: "600",
                color: "var(--text-muted-color)",
              }}
            >
              Categories in this Group (Total:{" "}
              {formatIndianNumber(selectedGroup.amount)})
            </div>
            {groupCategoriesSummary.map((cat) => (
              <div
                key={cat.name}
                className="group-summary-card"
                onClick={() => {
                  setTransactions(groupAndSortTransactions(cat.transactions));
                  setViewMode("transactions");
                  setSelectedCategory(cat.name);
                  setSelectedAmount(cat.amount);
                }}
                role="button"
                tabIndex={0}
              >
                <div className="group-details">
                  <div className="group-report-name">{cat.name}</div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                    }}
                  >
                    <div
                      className={`group-amount ${type === "Income" ? "green-text" : "red-text"}`}
                    >
                      {formatIndianNumber(Math.abs(cat.amount))}
                    </div>
                    <div className="transaction-percentage">
                      {cat.percentage}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AppLayout>
      )}

      {viewMode === "transactions" && selectedGroup && (
        <AppLayout
          title={`${selectedGroup.name} - ${selectedCategory}`}
          onBack={handleBack}
        >
          <TransactionsMode
            name={`${selectedGroup.name} - ${selectedCategory}`}
            amount={selectedAmount}
            transactions={transactions}
          />
        </AppLayout>
      )}
    </>
  );
};

export default SummaryByGroup;
