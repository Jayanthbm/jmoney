// src/components/Views/DailyLimitView.jsx

import React, { useEffect, useState } from "react";

import AppLayout from "../Layouts/AppLayout";
import CircularProgressBar from "../Charts/CircularProgressBar";
import InlineLoader from "../Loader/InlineLoader";
import NoDataCard from "../Cards/NoDataCard";
import OverviewCard from "../Cards/OverviewCard";
import TransactionCard from "../Cards/TransactionCard";
import { formatIndianNumber } from "../../utils";
import { getAllTransactions } from "../../db/transactionDb";
import { isToday } from "date-fns";
import useTheme from "../../hooks/useTheme";
import MySkeletion from "../Loader/MySkeletion";

const DailyLimitView = ({ dailyLimitData, title, onBack }) => {
  const [todayExpenses, setTodayExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchTodayExpenses = async () => {
      setLoading(true);
      const allTx = await getAllTransactions();
      let todayTx = allTx.filter(
        (tx) => tx.type === "Expense" && isToday(new Date(tx.date))
      );
      todayTx = todayTx.sort(
        (a, b) =>
          new Date(b.transaction_timestamp) - new Date(a.transaction_timestamp)
      );
      setTodayExpenses(todayTx);
      setLoading(false);
    };

    fetchTodayExpenses();
  }, []);

  return (
    <AppLayout title={title} onBack={onBack}>
      <div className="daily-limit-view">
        {/* Daily Limit Card */}
        <div className="overview-card-wrapper">
          <OverviewCard
            title="Daily Limit"
            subtitle={`Limit: ${formatIndianNumber(
              dailyLimitData?.daily_limit
            )}`}
          >
            <div className="daily-limit-container">
              {/* Remaining */}
              <div className="daily-limit-section">
                {dailyLimitData?.remaining_percentage > 0 ? (
                  <>
                    <div className="daily-limit-label">REMAINING</div>
                    <div className="daily-limit-value green-text">
                      {formatIndianNumber(dailyLimitData?.remaining || 0)}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="daily-limit-label">OVERSPENT</div>
                    <div className="daily-limit-value red-text">
                      {formatIndianNumber(
                        dailyLimitData?.spent - dailyLimitData.daily_limit
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="divider" />

              {/* Spent */}
              <div className="daily-limit-section">
                <div className="daily-limit-label">SPENT</div>
                <div className="daily-limit-value red-text">
                  {formatIndianNumber(dailyLimitData?.spent || 0)}
                </div>
              </div>

              {/* Circular Progress */}
              <div className="daily-limit-section progress-section">
                <CircularProgressBar
                  progress={
                    dailyLimitData?.remaining_percentage > 0
                      ? dailyLimitData.remaining_percentage
                      : 100 || 0
                  }
                  text={
                    dailyLimitData?.remaining_percentage > 0
                      ? `${dailyLimitData.remaining_percentage}%`
                      : "⚠︎"
                  }
                  pathColor={
                    dailyLimitData?.remaining_percentage > 0
                      ? "#3ecf8e"
                      : "#ef4444"
                  }
                  fontSize={
                    dailyLimitData?.remaining_percentage < 0 ? "1.5rem" : "1rem"
                  }
                  textColor={
                    dailyLimitData?.remaining_percentage < 0
                      ? "#ef4444"
                      : theme === "dark"
                        ? "#f1f1f1"
                        : "#374151"
                  }
                />
              </div>
            </div>
          </OverviewCard>
        </div>

        {/* Today's Transactions */}
        <div className="transaction-list-wrapper">
          <div className="date-summary-bar">
            <div className="summary-date">Today</div>
          </div>
          {loading ? (
            <>
              <InlineLoader />
              <MySkeletion count={3} keyName="daily-limit-view" height={70} />
            </>
          ) : todayExpenses?.length === 0 ? (
            <NoDataCard message="No expenses today" height="150" width="150" />
          ) : (
            <>
              {todayExpenses?.map((tx) => (
                <TransactionCard key={tx.id} transaction={tx} />
              ))}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default DailyLimitView;
