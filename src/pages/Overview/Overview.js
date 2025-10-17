// src/pages/Overview/Overview.js

import "./Overview.css";

import React, { useCallback, useEffect, useState } from "react";
import { endOfMonth, isThisYear, isToday, startOfMonth, } from "date-fns";
import { loadTransactionsFromSupabase, needsTransactionSync } from "../../supabaseData";

import AppLayout from "../../components/Layouts/AppLayout";
import DailyLimit from "./components/DailyLimit";
import DailyLimitView from "../../components/Views/DailyLimitView";
import MyCountUp from "../../components/Charts/MyCountUp";
import OverviewCard from "../../components/Cards/OverviewCard";
import PayDay from "./components/PayDay";
import PayDayView from "../../components/Views/PayDayView";
import RemainingForPeriod from "./components/RemainingForPeriod";
import StatCard from "../../components/Cards/StatCard";
import SummaryView from "../../components/Views/SummaryView";
import TopCategories from "./components/TopCategories";
import {
  calculatePayDayInfo,
} from "../../utils";
import { getAllTransactions } from "../../db/transactionDb";

const Overview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("Overview");
  const cardStyles = { cursor: 'default' };

  const fetchOverviewLocal = useCallback(async () => {
    setLoading(true);
    let allTx;
    let shouldSync = await needsTransactionSync();
    if (shouldSync) {
      allTx = await loadTransactionsFromSupabase()
    }
    allTx = await getAllTransactions();
    const today = new Date();
    const startMonth = startOfMonth(today);
    const endMonth = endOfMonth(today);

    const sumTx = (txs) => txs.reduce((sum, t) => sum + t.amount, 0);

    const monthIncomeTx = allTx.filter(
      (tx) =>
        tx.type === "Income" &&
        new Date(tx.date) >= startMonth &&
        new Date(tx.date) <= endMonth
    );

    const totalMonthIncome = sumTx(monthIncomeTx);

    const monthExpenseTx = allTx.filter(
      (tx) =>
        tx.type === "Expense" &&
        new Date(tx.date) >= startMonth &&
        new Date(tx.date) <= endMonth
    );

    const totalMonthExpense = sumTx(monthExpenseTx);

    // Remaining for Period
    const remainingForPeriod = {
      period: `${startMonth.getDate().toString().padStart(2, "0")}/${(startMonth.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${startMonth.getFullYear().toString().slice(2)} - ${endMonth
          .getDate()
          .toString()
          .padStart(2, "0")}/${(endMonth.getMonth() + 1)
            .toString()
            .padStart(2, "0")}/${endMonth.getFullYear().toString().slice(2)}`,
      remaining: parseFloat((totalMonthIncome - totalMonthExpense).toFixed(2)),
      spent_percentage: totalMonthIncome === 0 ? 0 : parseFloat(((totalMonthExpense / totalMonthIncome) * 100).toFixed(0))
    };

    // Daily Limit
    const spentTodayTx = allTx.filter((tx) => tx.type === "Expense" && isToday(new Date(tx.date)));
    const spentToday = sumTx(spentTodayTx);

    // Remaining days in month (inclusive of today)
    const msPerDay = 24 * 60 * 60 * 1000;
    const remainingDays = Math.floor((endMonth - today) / msPerDay) + 1;

    const spentTillYesterday = (totalMonthIncome - totalMonthExpense + spentToday)
    // Daily limit = (income - spentTillYesterday) / remainingDays
    const dailyLimitAmount =
      remainingDays > 0 ? (spentTillYesterday / remainingDays) : 0;

    // Remaining for today = daily limit - today's spending
    const remainingToday = dailyLimitAmount - spentToday;

    // Construct object
    const dailyLimit = {
      daily_limit: parseFloat(dailyLimitAmount.toFixed(2)),
      spent: parseFloat(spentToday.toFixed(2)),
      remaining: parseFloat(remainingToday.toFixed(2)),
      remaining_percentage:
        dailyLimitAmount === 0
          ? 0
          : parseFloat(((remainingToday / dailyLimitAmount) * 100).toFixed(2)),
    };

    // Top Categories (same as before)
    const categoryMap = {};
    monthExpenseTx.forEach((tx) => {
      if (!categoryMap[tx.category_name]) categoryMap[tx.category_name] = 0;
      categoryMap[tx.category_name] += tx.amount;
    });

    const sortedCategories = Object.entries(categoryMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);

    const topTwo = sortedCategories.slice(0, 2);
    const others = sortedCategories.slice(2);

    const otherSum = sumTx(others);

    const topCategories = [
      ...topTwo,
      ...(otherSum > 0 ? [{ name: "Other", amount: otherSum }] : []),
    ].map((cat) => ({
      ...cat,
      percentage: totalMonthExpense === 0 ? 0 : parseFloat(((cat.amount / totalMonthExpense) * 100).toFixed(2)),
      period: `${startMonth.getDate().toString().padStart(2, "0")}/${(startMonth.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${startMonth.getFullYear().toString().slice(2)} - ${endMonth
          .getDate()
          .toString()
          .padStart(2, "0")}/${(endMonth.getMonth() + 1)
            .toString()
            .padStart(2, "0")}/${endMonth.getFullYear().toString().slice(2)}`,
    }));

    // Current Month
    const current_month = {
      period: `${today.toLocaleString("default", { month: "long" })} ${today.getFullYear()}`,
      income: parseFloat(totalMonthIncome.toFixed(2)),
      expense: parseFloat(totalMonthExpense.toFixed(2)),
      spent_percentage: parseFloat((totalMonthExpense / totalMonthIncome * 100).toFixed(2)),
    };

    // Current Year
    const yearIncomeTx = allTx.filter((tx) => tx.type === "Income" && isThisYear(new Date(tx.date)));
    const yearExpenseTx = allTx.filter((tx) => tx.type === "Expense" && isThisYear(new Date(tx.date)));
    const totalYearIncome = sumTx(yearIncomeTx);
    const totalYearExpense = sumTx(yearExpenseTx);
    const current_year = {
      period: today.getFullYear(),
      income: parseFloat(totalYearIncome.toFixed(2)),
      expense: parseFloat(totalYearExpense.toFixed(2)),
      spent_percentage: parseFloat((totalYearExpense / totalYearIncome * 100).toFixed(2)),
    };

    // Networth
    const networth = {
      amount: parseFloat(
        allTx.reduce((sum, tx) => (tx.type === "Income" ? sum + tx.amount : sum - tx.amount), 0).toFixed(3)
      ),
    };

    // PayDay
    const payDay = calculatePayDayInfo();
    let result = {
      remainingForPeriod,
      dailyLimit,
      topCategories,
      current_month,
      current_year,
      networth,
      payDay,
    };
    setData(result);
    setLoading(false);
    return true;
  }, []);

  useEffect(() => {
    fetchOverviewLocal();
  }, [fetchOverviewLocal]);

  const [viewMode, setViewMode] = useState("overview");

  const onBack = () => {
    setViewMode('overview');
    setTitle('Overview');
  }
  return (
    <>
      {viewMode === "overview" && (
        <AppLayout
          title={title}
          loading={!data || loading}
          onBack={
            viewMode !== 'overview' ? () => {
            setViewMode('overview');
              setTitle('Overview');
            } : null
          }
        >
          <div className="overview-container">
          {/* Remainng for Period */}
          <div className="overview-card-wrapper">
            <RemainingForPeriod data={data?.remainingForPeriod} />
          </div>

          {/* Daily Limit */}
          <div
            className="overview-card-wrapper"
            onClick={() => {
              setViewMode("dailyLimit");
              setTitle('Daily Limit');
            }}
          >
            <DailyLimit data={data?.dailyLimit} />
          </div>

          {/* Pay Day */}
          <div
            className="overview-card-wrapper"
            onClick={() => {
              setViewMode("payDay");
              setTitle('Calendar View');
            }}
          >
            <PayDay data={data?.payDay} />
          </div>

          {/* Top Categories */}
          <div
            className="overview-card-wrapper"
            onClick={() => {
              if (data?.topCategories?.length > 0) {
                setViewMode("topCategories");
                setTitle('Top Categories');
              }

            }}
          >
            <TopCategories data={data} />
          </div>

          {/* Current Month */}
          <StatCard
            title="This Month"
            subtitle={data?.current_month?.period}
            expense={data?.current_month?.expense}
            income={data?.current_month?.income}
            percentage={data?.current_month?.spent_percentage}
            onClick={() => {
              setViewMode("thisMonth");
              setTitle('Summary For Month');
            }}
          />

          {/* Current Year */}
          <StatCard
            title="Current Year"
            subtitle={data?.current_year?.period}
            expense={data?.current_year?.expense}
            income={data?.current_year?.income}
            percentage={data?.current_year?.spent_percentage}
            onClick={() => {
              setViewMode("currentYear");
              setTitle('Summary For Year');
            }}
          />

          {/* Net Worth */}
          <div className="overview-card-wrapper">
            <OverviewCard title="Net Worth" subtitle="ALL TIME" customStyles={cardStyles}>
              <div>
                <div className="big-income-text">
                  <MyCountUp end={data?.networth?.amount || 0} />
                </div>
              </div>
            </OverviewCard>
          </div>
        </div>
        </AppLayout>
      )}
      {viewMode === "dailyLimit" && (
        <DailyLimitView dailyLimitData={data?.dailyLimit} title={title} onBack={onBack} />
      )}
      {viewMode === "payDay" && <PayDayView title={title} onBack={onBack} />}

      {(viewMode === "topCategories" || viewMode === "thisMonth" || viewMode === "currentYear") && <SummaryView title={title} onBack={onBack} showMonthSelect={viewMode === "currentYear" ? false : true} />}
    </>
  );
};

export default Overview;