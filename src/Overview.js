import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabaseClient";
import { get } from "idb-keyval";
import AppLayout from "./components/AppLayout";
import MyCountUp from "./components/MyCountUp";
import OverviewCard from "./components/OverviewCard";
import ProgressBar from "./components/ProgressBar";
import StatCard from "./components/StatCard";
import CustomDonutChart from "./components/CustomDonutChart";
import CircularProgressBar from "./components/CircularProgressBar";
import { fetchUserOverviewData } from "./supabaseData";
import {
  calculatePayDayInfo,
  formatIndianNumber,
  isCacheExpired,
} from "./utils";

import "./Overview.css";
import useTheme from "./hooks/useTheme";
import DailyLimitView from "./components/DailyLimitView";
import PayDayView from "./components/PayDayView";
import SummaryView from "./components/SummaryView";

const Overview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const refreshData = useCallback(async () => {
    const user = (await supabase.auth.getUser())?.data?.user;
    if (user) {
      const freshData = await fetchUserOverviewData(user.id);
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

    // 1. Read from cache
    let fetchNeeded = false;
    for (const key of keys) {
      const cache = await get(key);
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

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const CATEGORY_COLORS = ["#3b82f6", "#10b981", "#9ca3af"];

  const [viewMode, setViewMode] = useState("overview");
  return (
    <AppLayout
      title="Overview"
      loading={!data || loading}
      onRefresh={() => {
        refreshData();
      }}
    >
      {viewMode !== "overview" && (
        <button className="back-button" onClick={() => setViewMode("overview")}>
          ← Overview
        </button>
      )}
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
            onClick={() => setViewMode("dailyLimit")}
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
                  <div className="daily-limit-value green-text">
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
                    progress={data?.dailyLimit?.remaining_percentage || 0}
                    text={`${data?.dailyLimit?.remaining_percentage || 0}%`}
                    pathColor="#3ecf8e"
                    textColor={theme === "dark" ? "#f1f1f1" : "#374151"}
                  />
                </div>
              </div>
            </OverviewCard>
          </div>

          {/* Pay Day */}
          <div
            className="overview-card-wrapper"
            onClick={() => setViewMode("payDay")}
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
            onClick={() => setViewMode("topCategories")}
          >
            <OverviewCard
              title="Top Categories"
              subtitle={data?.remainingForPeriod?.period}
            >
              <div className="top-categories-donut">
                {/* Section 1: Labels */}
                <div className="category-labels">
                  {data?.topCategories?.length > 0 && (
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
                  )}
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
            </OverviewCard>
          </div>

          {/* Current Month */}
          <StatCard
            title="This Month"
            subtitle={data?.current_month?.period}
            expense={data?.current_month?.expense}
            income={data?.current_month?.income}
            percentage={data?.current_month?.spent_percentage}
            onClick={() => setViewMode("thisMonth")}
          />

          {/* Current Year */}
          <StatCard
            title="Current Year"
            subtitle={data?.current_year?.period}
            expense={data?.current_year?.expense}
            income={data?.current_year?.income}
            percentage={data?.current_year?.spent_percentage}
            onClick={() => setViewMode("currentYear")}
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
      {viewMode === "thisMonth" && (
        <SummaryView title="Summary For Month" filterToCurrentMonth />
      )}
      {viewMode === "currentYear" && (
        <SummaryView title="Summary For Year" showMonthSelect={false} />
      )}
    </AppLayout>
  );
};

export default Overview;
