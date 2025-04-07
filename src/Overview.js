import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabaseClient";
import Loading from "./components/Loading";
import "./Overview.css";
import OverviewCard from "./components/OverviewCard";
import ProgressBar from "./components/ProgressBar";
import { FiRefreshCw } from "react-icons/fi";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { PieChart } from "react-minimal-pie-chart";
import MyCountUp from "./components/MyCountUp";
import { formatIndianNumber } from "./utils";
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
      const user = (await supabase.auth.getUser())?.data?.user;
      if (!user) {
        setLoading(false);
        return;
      }

      const uid = user.id;
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
        const storageKey = `${uid}_${fn}`;
        const cached = localStorage.getItem(storageKey);
        let shouldFetch = force;

        if (!force && cached) {
          try {
            const { data: cachedData, timestamp, date } = JSON.parse(cached);
            if (!isCacheExpired(timestamp, date)) {
              result[key] = cachedData;
              shouldFetch = false;
            }
          } catch (e) {
            console.error("Failed to parse cached data", e);
          }
        }

        if (shouldFetch || cached === null) {
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

          localStorage.setItem(
            storageKey,
            JSON.stringify({
              data: normalizedData,
              timestamp: new Date().toISOString(),
              date: today,
            })
          );
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
  const COLORS = {
    income: "#3ecf8e", // green
    expense: "#f87171", // red
    text: "#374752", // label
  };

  const StatCard = ({ title, subtitle, income, expense, percentage }) => {
    return (
      <div className="overview-card-wrapper">
        <OverviewCard title={title} subtitle={subtitle}>
          <div className="stat-card-container">
            {/* Section 1: Text */}
            <div className="stat-card-numbers">
              <div className="stat-row">
                <div className="stat-amount red-text">
                  ₹{formatIndianNumber(expense)}
                </div>
                <div className="stat-label">EXPENSE</div>
              </div>
              <div className="stat-row">
                <div className="stat-amount green-text">
                  ₹{formatIndianNumber(income)}
                </div>
                <div className="stat-label">INCOME</div>
              </div>
            </div>

            {/* Section 2: CircularProgressbar */}
            <div className="stat-chart">
              <CircularProgressbar
                value={Math.round(percentage)}
                text={`${Math.round(percentage)}%`}
                styles={buildStyles({
                  pathColor: COLORS.expense,
                  trailColor: "#e5e7eb", // light gray
                  textColor: COLORS.text,
                  textSize: "16px",
                  strokeLinecap: "round",
                })}
              />
            </div>
          </div>
        </OverviewCard>
      </div>
    );
  };
  return (
    <div className="container">
      <div className="right-align">
        <button
          className="refresh-button"
          onClick={() => fetchOverview(true)}
          disabled={loading}
        >
          <FiRefreshCw className="refresh-icon" />
          Refresh
        </button>
      </div>

      {loading || !data ? (
        <Loading />
      ) : (
        <>
          <div className="overview-container">
            {/* Remainng for Period */}
            <div className="overview-card-wrapper">
              <OverviewCard
                title="Remaining for Period"
                subtitle={data?.remainingForPeriod?.period}
              >
                <div>
                  <div className="big-income-text">
                    ₹{" "}
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
                    <CircularProgressbar
                      value={data?.dailyLimit?.remaining_percentage || 0}
                      text={`${data?.dailyLimit?.remaining_percentage || 0}%`}
                      styles={buildStyles({
                        pathColor: "#3ecf8e",
                        strokeLinecap: "round",
                        trailColor: "#eee",
                        textColor: "#000",
                        textSize: "18px",
                      })}
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
                    <div className="payday-date">
                      {data?.payDay?.date || ""}
                    </div>
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
                    <CircularProgressbar
                      value={100 - data?.payDay?.remaining_days_percentage || 0}
                      text={`${data?.payDay?.remaining_days || 0} \ndays`}
                      styles={buildStyles({
                        pathColor: "#139af5",
                        strokeLinecap: "round",
                        trailColor: "#eee",
                        textColor: "#2c6c99",
                        textSize: "16px",
                      })}
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
                    {data?.topCategories?.length > 0 && (
                      <PieChart
                        data={data?.topCategories?.map((cat, index) => ({
                          title: cat.name,
                          value: cat.percentage,
                          color: CATEGORY_COLORS[index],
                        }))}
                        lineWidth={20}
                        rounded
                        animate
                        startAngle={270}
                      />
                    )}
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
                    ₹ <MyCountUp end={data?.networth?.amount || 0} />
                  </div>
                </div>
              </OverviewCard>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Overview;
