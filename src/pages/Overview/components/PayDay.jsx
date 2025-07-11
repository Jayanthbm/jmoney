// src/pages/Overview/components/PayDay.jsx

import CircularProgressBar from '../../../components/Charts/CircularProgressBar';
import OverviewCard from '../../../components/Cards/OverviewCard';
import PropTypes from 'prop-types';
import React from 'react';
import useTheme from '../../../hooks/useTheme';

const PayDay = ({ data }) => {
  const theme = useTheme();

  const daysInMonth = data?.days_in_month || 30;
  const today = data?.today || 0;
  const remainingDaysPercentage = data?.remaining_days_percentage || 0;
  const remainingDays = data?.remaining_days || 0;

  return (
    <OverviewCard title="Pay Day" subtitle="Days until next salary">
      <div className="payday-container">
        {/* Section 1: Pay Date & Dot Grid */}
        <div className="payday-info">
          <div className="payday-date">{data?.date || ""}</div>
          <div className="dot-grid">
            {Array.from({ length: daysInMonth }).map((_, i) => (
              <div
                key={i}
                className={`dot ${i + 1 < today ? "dot-past" : "dot-future"}`}
              />
            ))}
          </div>
        </div>

        {/* Section 2: Circular Progress */}
        <div className="payday-progress">
          <CircularProgressBar
            progress={100 - remainingDaysPercentage}
            text={`${remainingDays}`}
            subtext="DAYS"
            pathColor="#139af5"
            textColor={theme === "dark" ? "#5d9bff" : "#2c6c99"}
          />
        </div>
      </div>
    </OverviewCard>
  );
};

PayDay.propTypes = {
  data: PropTypes.shape({
    date: PropTypes.string,
    days_in_month: PropTypes.number,
    today: PropTypes.number,
    remaining_days_percentage: PropTypes.number,
    remaining_days: PropTypes.number,
  }),
};

export default React.memo(PayDay);
