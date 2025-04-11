import OverviewCard from "./OverviewCard";
import CircularProgressBar from "./CircularProgressBar";
import { formatIndianNumber } from "../utils";
import useTheme from "../hooks/useTheme";

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
}) => {
  const theme = useTheme();
  return (
    <div className="overview-card-wrapper" onClick={onClick}>
      <OverviewCard title={title} subtitle={subtitle}>
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
              pathColor={COLORS.expense}
              textColor={theme === "dark" ? "#f1f1f1" : "#374151"}
            />
          </div>
        </div>
      </OverviewCard>
    </div>
  );
};

export default StatCard;
