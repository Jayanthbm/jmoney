// src/pages/Overview/components/DailyLimit.jsx

import CircularProgressBar from "../../../components/Charts/CircularProgressBar";
import OverviewCard from "../../../components/Cards/OverviewCard";
import PropTypes from "prop-types";
import React from "react";
import { formatIndianNumber } from "../../../utils";
import useTheme from "../../../hooks/useTheme";
import MySkeletion from "../../../components/Loader/MySkeletion";

const DailyLimit = ({ data, loading }) => {
  const theme = useTheme();

  const subtitle = `Limit: ${formatIndianNumber(data?.daily_limit)}`;

  return (
    <OverviewCard title="Daily Limit" subtitle={subtitle}>
      <div className="daily-limit-container">
        {loading ? (
          <MySkeletion count={2} keyName="daily-limit" />
        ) : (
          <>
            {/* Remaining / Overspent */}
            <div className="daily-limit-section">
              {data?.remaining_percentage > 0 ? (
                <>
                  <div className="daily-limit-label">REMAINING</div>
                  <div className="daily-limit-value green-text">
                    {formatIndianNumber(data?.remaining || 0)}
                  </div>
                </>
              ) : (
                <>
                  <div className="daily-limit-label">OVERSPENT</div>
                  <div className="daily-limit-value red-text">
                    {formatIndianNumber(
                      (data?.spent || 0) - (data?.daily_limit || 0)
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="divider" />

            {/* Spent */}
            <div className="daily-limit-section">
              <div className="daily-limit-label">SPENT</div>
              <div className="daily-limit-value red-text">
                {formatIndianNumber(data?.spent || 0)}
              </div>
            </div>

            {/* Circular Progress */}
            <div className="daily-limit-section progress-section">
              <CircularProgressBar
                size={70}
                progress={
                  data?.remaining_percentage > 0
                    ? data.remaining_percentage
                    : 100
                }
                text={
                  data?.remaining_percentage > 0
                    ? `${data.remaining_percentage}%`
                    : "⚠︎"
                }
                pathColor={
                  data?.remaining_percentage > 0 ? "#3ecf8e" : "#ef4444"
                }
                fontSize={data?.remaining_percentage < 0 ? "1.1rem" : "0.8rem"}
                textColor={
                  data?.remaining_percentage < 0
                    ? "#ef4444"
                    : theme === "dark"
                      ? "#f1f1f1"
                      : "#374151"
                }
              />
            </div>
          </>
        )}
      </div>
    </OverviewCard>
  );
};

DailyLimit.propTypes = {
  data: PropTypes.shape({
    daily_limit: PropTypes.number,
    remaining_percentage: PropTypes.number,
    remaining: PropTypes.number,
    spent: PropTypes.number,
  }),
};

export default React.memo(DailyLimit);
