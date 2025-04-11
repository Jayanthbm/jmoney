import React, { useEffect, useState } from "react";
import OverviewCard from "./OverviewCard";
import CircularProgressBar from "./CircularProgressBar";
import TransactionCard from "./TransactionCard";
import { getAllTransactions } from "../db";
import { formatIndianNumber, isToday } from "../utils";
import useTheme from "../hooks/useTheme";

const DailyLimitView = ({ dailyLimitData, onBack }) => {
  const [todayExpenses, setTodayExpenses] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    const fetchTodayExpenses = async () => {
      const allTx = await getAllTransactions();
      const todayTx = allTx.filter(
        (tx) => tx.type === "expense" && isToday(tx.date)
      );
      setTodayExpenses(todayTx);
    };

    fetchTodayExpenses();
  }, []);

  return (
    <div>
      <div className="sub-section-heading">Daily Limit</div>
      <div className="daily-limit-view">
        {/* Daily Limit Card */}
        <div className="overview-card-wrapper">
          <OverviewCard
            title="Daily Limit"
            subtitle={`Limit: ₹${formatIndianNumber(
              dailyLimitData?.daily_limit
            )}`}
          >
            <div className="daily-limit-container">
              {/* Remaining */}
              <div className="daily-limit-section">
                <div className="daily-limit-label">REMAINING</div>
                <div className="daily-limit-value green-text">
                  ₹{formatIndianNumber(dailyLimitData?.remaining || 0)}
                </div>
              </div>

              <div className="divider" />

              {/* Spent */}
              <div className="daily-limit-section">
                <div className="daily-limit-label">SPENT</div>
                <div className="daily-limit-value red-text">
                  ₹{formatIndianNumber(dailyLimitData?.spent || 0)}
                </div>
              </div>

              {/* Circular Progress */}
              <div className="daily-limit-section progress-section">
                <CircularProgressBar
                  progress={dailyLimitData?.remaining_percentage || 0}
                  text={`${dailyLimitData?.remaining_percentage || 0}%`}
                  pathColor="#3ecf8e"
                  textColor={theme === "dark" ? "#f1f1f1" : "#374151"}
                />
              </div>
            </div>
          </OverviewCard>
        </div>

        {/* Today's Transactions */}
        <div className="transaction-list-wrapper">
          {todayExpenses.length === 0 ? (
            <div className="no-data-card">No expenses today</div>
          ) : (
            todayExpenses.map((tx) => (
              <TransactionCard key={tx.id} transaction={tx} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyLimitView;
