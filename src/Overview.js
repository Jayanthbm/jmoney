import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabaseClient";
import { get, set } from "idb-keyval";

import AppLayout from "./components/AppLayout";
import MyCountUp from "./components/MyCountUp";
import OverviewCard from "./components/OverviewCard";
import ProgressBar from "./components/ProgressBar";
import StatCard from "./components/StatCard";
import CustomDonutChart from "./components/CustomDonutChart";
import CircularProgressBar from "./components/CircularProgressBar";

import { formatIndianNumber } from "./utils";

import "./Overview.css";

const CACHE_EXPIRY_HOURS = 20;

const Overview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const isCacheExpired = useCallback((timestamp, storedDate) => {
    const now = new Date();
    const diffHours = (now - new Date(timestamp)) / 1000 / 60 / 60;
    const today = now.toISOString().split("T")[0];
    return diffHours > CACHE_EXPIRY_HOURS || storedDate !== today;
  }, []);

  const fetchOverview = useCallback(
    async (force = false) => {
      setLoading(true);

      const today = new Date().toISOString().split("T")[0];
      const calls = [
        { key: "remainingForPeriod", fn: "get_user_overview_remaining" },
        { key: "dailyLimit", fn: "get_user_overview_daily_limit" },
        { key: "payDay", fn: "get_user_overview_pay_day" },
        { key: "topCategories", fn: "get_user_overview_top_categories" },
        { key: "current_month", fn: "get_user_overview_current_month" },
        { key: "current_year", fn: "get_user_overview_current_year" },
        { key: "networth", fn: "get_user_overview_networth" },
      ];

      const result = {};

      for (const { key, fn } of calls) {
        const cache = await get(fn);
        let shouldFetch = force;

        if (!force && cache) {
          try {
            const { data: cachedData, timestamp, date } = cache;
            if (!isCacheExpired(timestamp, date)) {
              result[key] = cachedData;
              shouldFetch = false;
            } else {
              shouldFetch = true;
            }
          } catch (e) {
            console.error("Failed to parse cached data", e);
          }
        }

        if (shouldFetch || !cache) {
          const user = (await supabase.auth.getUser())?.data?.user;
          if (!user) {
            setLoading(false);
            return;
          }

          const uid = user.id;
          const { data: freshData, error } = await supabase.rpc(fn, { uid });
          if (error) {
            console.error(`Error fetching ${key}`, error);
            continue;
          }

          const normalizedData =
            Array.isArray(freshData) && freshData.length === 1
              ? freshData[0]
              : freshData;

          result[key] = normalizedData;

          await set(fn, {
            data: normalizedData,
            timestamp: new Date().toISOString(),
            date: today,
          });
        }
      }

      setData(result);
      setLoading(false);
    },
    [isCacheExpired]
  );

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const CATEGORY_COLORS = ["#3b82f6", "#10b981", "#9ca3af"];

  return (
    <AppLayout
      title="Overview"
      loading={!data || loading}
      onRefresh={() => {
        fetchOverview(true);
      }}
    >
      <div className="overview-container">
        {/* Remainng for Period */}
        <div className="overview-card-wrapper">
          <OverviewCard
            title="Remaining for Period"
            subtitle={data?.remainingForPeriod?.period}
          >
            <div>
              <div className="big-income-text">
                ₹<MyCountUp end={data?.remainingForPeriod?.remaining || 0} />
              </div>
              <ProgressBar
                value={data?.remainingForPeriod?.spent_percentage || 0}
                color="#3ecf8e"
              />
            </div>
          </OverviewCard>
        </div>

        {/* Daily Limit */}
        <div className="overview-card-wrapper">
          <OverviewCard
            title="Daily Limit"
            subtitle={`Limit: ₹${formatIndianNumber(
              data?.dailyLimit?.daily_limit
            )}`}
          >
            <div className="daily-limit-container">
              {/* Remaining */}
              <div className="daily-limit-section">
                <div className="daily-limit-label">REMAINING</div>
                <div className="daily-limit-value green-text">
                  ₹{formatIndianNumber(data?.dailyLimit?.remaining || 0)}
                </div>
              </div>

              {/* Divider */}
              <div className="divider" />

              {/* Spent */}
              <div className="daily-limit-section">
                <div className="daily-limit-label">SPENT</div>
                <div className="daily-limit-value red-text">
                  ₹{formatIndianNumber(data?.dailyLimit?.spent || 0)}
                </div>
              </div>

              {/* Circular Progress */}
              <div className="daily-limit-section progress-section">
                <CircularProgressBar
                  progress={data?.dailyLimit?.remaining_percentage || 0}
                  text={`${data?.dailyLimit?.remaining_percentage || 0}%`}
                  pathColor="#3ecf8e"
                  textColor="#374151"
                />
              </div>
            </div>
          </OverviewCard>
        </div>

        {/* Pay Day */}
        <div className="overview-card-wrapper">
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
                        i + 1 < data?.payDay?.today ? "dot-past" : "dot-future"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Section 2: Circular Progress */}
              <div className="payday-progress">
                <CircularProgressBar
                  progress={100 - data?.payDay?.remaining_days_percentage || 0}
                  text={`${data?.payDay?.remaining_days || 0} \ndays`}
                  pathColor="#139af5"
                  textColor="#2c6c99"
                />
              </div>
            </div>
          </OverviewCard>
        </div>

        {/* Top Categories */}
        <div className="overview-card-wrapper">
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
                            ₹{formatIndianNumber(cat?.amount || 0)} |{" "}
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
        />

        {/* Current Year */}
        <StatCard
          title="Current Year"
          subtitle={data?.current_year?.period}
          expense={data?.current_year?.expense}
          income={data?.current_year?.income}
          percentage={data?.current_year?.spent_percentage}
        />

        {/* Net Worth */}
        <div className="overview-card-wrapper">
          <OverviewCard title="Net Worth" subtitle="ALL TIME">
            <div>
              <div className="big-income-text">
                ₹<MyCountUp end={data?.networth?.amount || 0} />
              </div>
            </div>
          </OverviewCard>
        </div>
      </div>
    </AppLayout>
  );
};

export default Overview;
