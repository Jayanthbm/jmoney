// src/components/Cards/StatCard.jsx

import CircularProgressBar from "../Charts/CircularProgressBar";
import OverviewCard from "./OverviewCard";
import { formatIndianNumber } from "../../utils";
import useTheme from "../../hooks/useTheme";
import MySkeletion from "../Loader/MySkeletion";

const COLORS = {
  income: "#3ecf8e", // green
  expense: "#f87171", // red
};
const StatCard = ({
  title,
  subtitle,
  income,
  expense,
  percentage,
  onClick,
  loading,
}) => {
  const theme = useTheme();
  return (
    <div className="overview-card-wrapper" onClick={onClick}>
      <OverviewCard title={title} subtitle={subtitle}>
        {loading ? (
          <>
            <div className="top-categories-donut">
              <div className="category-labels">
                <MySkeletion count={2} keyName="stat-card" />
              </div>
              <div className="category-donut-chart">
                <MySkeletion
                  count={1}
                  keyName="stat-card-donut"
                  variant="circular"
                  width={"100%"}
                  height={"100%"}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="stat-card-container">
            {/* Section 1: Text */}
            <div className="stat-card-numbers">
              <div className="stat-row">
                <div className="stat-amount red-text">
                  {formatIndianNumber(expense)}
                </div>
                <div className="stat-label">EXPENSE</div>
              </div>
              <div className="stat-row">
                <div className="stat-amount green-text">
                  {formatIndianNumber(income)}
                </div>
                <div className="stat-label">INCOME</div>
              </div>
            </div>

            {/* Section 2: CircularProgressbar */}
            <div className="stat-chart">
              <CircularProgressBar
                progress={Math.round(percentage)}
                text={`${Math.round(percentage)}%`}
                subtext="spent"
                pathColor={COLORS.expense}
                textColor={theme === "dark" ? "#f1f1f1" : "#374151"}
              />
            </div>
          </div>
        )}
      </OverviewCard>
    </div>
  );
};

export default StatCard;
