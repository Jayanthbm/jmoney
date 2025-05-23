// src/pages/Overview/Overview.js

import "./Overview.css";

import React, { useCallback, useEffect, useState } from "react";
import {
  calculatePayDayInfo,
  formatIndianNumber,
  getSupabaseUserIdFromLocalStorage,
  isCacheExpired,
  refreshTransactionsCache,
} from "../../utils";

import AppLayout from "../../components/Layouts/AppLayout";
import CircularProgressBar from "../../components/Charts/CircularProgressBar";
import CustomDonutChart from "../../components/Charts/CustomDonutChart";
import DailyLimitView from "../../components/Views/DailyLimitView";
import MyCountUp from "../../components/Charts/MyCountUp";
import NoDataCard from "../../components/Cards/NoDataCard";
import OverviewCard from "../../components/Cards/OverviewCard";
import PayDayView from "../../components/Views/PayDayView";
import ProgressBar from "../../components/Charts/ProgressBar";
import StatCard from "../../components/Cards/StatCard";
import SummaryView from "../../components/Views/SummaryView";
import { fetchUserOverviewData } from "../../supabaseData";
import { get } from "idb-keyval";
import useTheme from "../../hooks/useTheme";

const Overview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("Overview");

  const theme = useTheme();
  const refreshData = useCallback(async () => {
    const userId = getSupabaseUserIdFromLocalStorage();
    if (userId) {
      const freshData = await fetchUserOverviewData(userId);
      setData({ ...freshData, payDay: calculatePayDayInfo() });
    }
  }, []);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    const keys = [
      "remainingForPeriod",
      "dailyLimit",
      "topCategories",
      "current_month",
      "current_year",
      "networth",
    ];

    const result = {};

    const userId = getSupabaseUserIdFromLocalStorage();
    // 1. Read from cache
    let fetchNeeded = false;
    for (const key of keys) {
      const cache = await get(userId + "_" + key);
      if (cache && !isCacheExpired(cache.timestamp, cache.date)) {
        result[key] = cache.data;
      } else {
        fetchNeeded = true;
      }
    }

    // 2. PayDay is always computed
    result.payDay = calculatePayDayInfo();
    setData(result);

    setLoading(false);
    if (fetchNeeded) {
      await refreshData();
    }
  }, [refreshData]);

  const fetchTransactions = useCallback(async () => {
    await refreshTransactionsCache();
  }, []);

  useEffect(() => {
    fetchOverview();
    fetchTransactions();
  }, [fetchOverview, fetchTransactions]);

  const CATEGORY_COLORS = ["#3b82f6", "#10b981", "#9ca3af"];

  const [viewMode, setViewMode] = useState("overview");


  return (
    <AppLayout
      title={title}
      loading={!data || loading}
      onRefresh={() => {
        refreshData();
      }}
      onBack={
        viewMode !== 'overview' ? () => {
          setViewMode('overview');
          setTitle('Overview');
        } : null
      }
    >
      {viewMode === "overview" && (
        <div className="overview-container">
          {/* Remainng for Period */}
          <div className="overview-card-wrapper">
            <OverviewCard
              title="Remaining for Period"
              subtitle={data?.remainingForPeriod?.period}
            >
              <div>
                <div className="big-income-text">
                  <MyCountUp end={data?.remainingForPeriod?.remaining || 0} />
                </div>
                <ProgressBar
                  value={data?.remainingForPeriod?.spent_percentage || 0}
                  color="#3ecf8e"
                />
              </div>
            </OverviewCard>
          </div>

          {/* Daily Limit */}
          <div
            className="overview-card-wrapper"
            onClick={() => {
              setViewMode("dailyLimit");
              setTitle('Daily Limit');
            }}
          >
            <OverviewCard
              title="Daily Limit"
              subtitle={`Limit: ${formatIndianNumber(
                data?.dailyLimit?.daily_limit
              )}`}
            >
              <div className="daily-limit-container">
                {/* Remaining */}
                <div className="daily-limit-section">
                  <div className="daily-limit-label">REMAINING</div>
                  <div
                    className={`daily-limit-value ${
                      data?.dailyLimit?.remaining < 0
                        ? "red-text"
                        : "green-text"
                    }`}
                  >
                    {formatIndianNumber(data?.dailyLimit?.remaining || 0)}
                  </div>
                </div>

                {/* Divider */}
                <div className="divider" />

                {/* Spent */}
                <div className="daily-limit-section">
                  <div className="daily-limit-label">SPENT</div>
                  <div className="daily-limit-value red-text">
                    {formatIndianNumber(data?.dailyLimit?.spent || 0)}
                  </div>
                </div>

                {/* Circular Progress */}
                <div className="daily-limit-section progress-section">
                  <CircularProgressBar
                    progress={
                      data?.dailyLimit?.remaining_percentage > 0
                        ? data.dailyLimit.remaining_percentage
                        : 100 || 0
                    }
                    text={
                      data?.dailyLimit?.remaining_percentage > 0
                        ? `${data.dailyLimit.remaining_percentage}%`
                        : "⚠︎"
                    }
                    pathColor={
                      data?.dailyLimit?.remaining_percentage > 0
                        ? "#3ecf8e"
                        : "#ef4444"
                    }
                    fontSize={
                      data?.dailyLimit?.remaining_percentage < 0
                        ? "1.1rem"
                        : "0.8rem"
                    }
                    textColor={
                      data?.dailyLimit?.remaining_percentage < 0
                        ? "#ef4444"
                        : theme === "dark"
                        ? "#f1f1f1"
                        : "#374151"
                    }
                    size={70}
                  />
                </div>
              </div>
            </OverviewCard>
          </div>

          {/* Pay Day */}
          <div
            className="overview-card-wrapper"
            onClick={() => {
              setViewMode("payDay");
              setTitle('Calendar View');
            }}
          >
            <OverviewCard title="Pay Day" subtitle="Days until next salary">
              <div className="payday-container">
                {/* Section 1: Pay Date & Dot Grid */}
                <div className="payday-info">
                  <div className="payday-date">{data?.payDay?.date || ""}</div>
                  <div className="dot-grid">
                    {Array.from({
                      length: data?.payDay?.days_in_month || 30,
                    }).map((_, i) => (
                      <div
                        key={i}
                        className={`dot ${
                          i + 1 < data?.payDay?.today
                            ? "dot-past"
                            : "dot-future"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Section 2: Circular Progress */}
                <div className="payday-progress">
                  <CircularProgressBar
                    progress={
                      100 - data?.payDay?.remaining_days_percentage || 0
                    }
                    text={`${data?.payDay?.remaining_days || 0} \ndays`}
                    pathColor="#139af5"
                    textColor={theme === "dark" ? "#5d9bff" : "#2c6c99"}
                  />
                </div>
              </div>
            </OverviewCard>
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
            <OverviewCard
              title="Top Categories"
              subtitle={data?.remainingForPeriod?.period}
            >
              {data?.topCategories?.length > 0 ? (
                <div className="top-categories-donut">
                  {/* Section 1: Labels */}
                  <div className="category-labels">
                    <>
                      {data?.topCategories?.map((cat, index) => (
                        <div key={index} className="category-label-item">
                          <span
                            className="category-dot"
                            style={{
                              backgroundColor: CATEGORY_COLORS[index],
                            }}
                          />
                          <div className="category-text">
                            <div className="category-name">{cat.name}</div>
                            <div className="category-value">
                              {formatIndianNumber(cat?.amount || 0)} |{" "}
                              {cat?.percentage || 0}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  </div>

                  {/* Section 2: Donut Chart */}
                  <div className="category-donut-chart">
                    <CustomDonutChart
                      data={data?.topCategories?.map((cat) => ({
                        value: cat?.percentage,
                      }))}
                      colors={CATEGORY_COLORS}
                    />
                  </div>
                </div>
              ) : (
                <NoDataCard message="No data available" height="100" width="150" />
              )}

            </OverviewCard>
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
            <OverviewCard title="Net Worth" subtitle="ALL TIME">
              <div>
                <div className="big-income-text">
                  <MyCountUp end={data?.networth?.amount || 0} />
                </div>
              </div>
            </OverviewCard>
          </div>
        </div>
      )}
      {viewMode === "dailyLimit" && (
        <DailyLimitView dailyLimitData={data?.dailyLimit} />
      )}
      {viewMode === "payDay" && <PayDayView />}
      {viewMode === "topCategories" && <SummaryView />}
      {viewMode === "thisMonth" && <SummaryView />}
      {viewMode === "currentYear" && (
        <SummaryView showMonthSelect={false} />
      )}
    </AppLayout>
  );
};

export default Overview;
