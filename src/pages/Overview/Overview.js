// src/pages/Overview/Overview.js

import "./Overview.css";

import React, { useCallback, useEffect, useState } from "react";
import {
  calculatePayDayInfo,
  getSupabaseUserIdFromLocalStorage,
  isCacheExpired,
  refreshTransactionsCache,
} from "../../utils";

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
import { fetchUserOverviewData } from "../../supabaseData";
import { get } from "idb-keyval";
import useDetectBack from "../../hooks/useDetectBack";

const Overview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("Overview");
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


  const [viewMode, setViewMode] = useState("overview");

  useDetectBack(viewMode !== "overview", () => {
    let isTransactions = JSON.parse(sessionStorage.getItem('transactionsViewMode') || false);
    if (!isTransactions) {
      setViewMode('overview');
      setTitle('Overview');
    }
  });


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
          sessionStorage.setItem('transactionsViewMode', JSON.stringify(false));
        } : null
      }
    >
      {viewMode === "overview" && (
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