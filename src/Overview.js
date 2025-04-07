import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabaseClient";
import Loading from "./components/Loading";
import "./Overview.css";
import OverviewCard from "./components/OverviewCard";
import CountUp from "react-countup";
import ProgressBar from "./components/ProgressBar";
import { FiRefreshCw } from "react-icons/fi";

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

        if (shouldFetch) {
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

  const formatIndianNumber = (value) => {
    return value.toLocaleString("en-IN");
  };

  const MyCountUp = ({ end }) => {
    return (
      <CountUp
        end={end}
        duration={1.5}
        formattingFn={formatIndianNumber}
        enableScrollSpy
        scrollSpyDelay={100}
      />
    );
  };

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

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
                    value={data?.remainingForPeriod?.spent_percentage}
                    color="#3ecf8e"
                  />
                </div>
              </OverviewCard>
            </div>

            {/* Daily Limit */}
            <div className="overview-card-wrapper">
              <OverviewCard
                title="Daily Limit"
                subtitle={`Limit: ₹${data?.dailyLimit?.daily_limit}`}
              ></OverviewCard>
            </div>

            {/* Pay Day */}
            <div className="overview-card-wrapper">
              <OverviewCard
                title="Pay Day"
                subtitle="Days until next salary"
              ></OverviewCard>
            </div>

            <div className="overview-card-wrapper">
              <OverviewCard
                title="Top Categories"
                subtitle={data?.remainingForPeriod?.period}
              ></OverviewCard>
            </div>

            {/* Current Month */}
            <div className="overview-card-wrapper">
              <OverviewCard
                title="This Month"
                subtitle={data?.current_month?.period}
              ></OverviewCard>
            </div>

            {/* Current Year */}
            <div className="overview-card-wrapper">
              <OverviewCard
                title="Current Year"
                subtitle={data?.current_year?.period}
              ></OverviewCard>
            </div>

            {/* Net Worth */}
            <div className="overview-card-wrapper">
              <OverviewCard title="Net Worth" subtitle="ALL TIME">
                <div>
                  <div className="big-income-text">
                    {" "}
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
