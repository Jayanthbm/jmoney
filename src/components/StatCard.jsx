import OverviewCard from "./OverviewCard";
import { formatIndianNumber } from "../utils";
import MyCircularProgress from "./MyCircularProgress";

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
            <MyCircularProgress
              value={Math.round(percentage)}
              text={`${Math.round(percentage)}%`}
              pathColor={COLORS.expense}
              textColor={COLORS.text}
              textSize="16px"
              trailColor="#e5e7eb"
            />
          </div>
        </div>
      </OverviewCard>
    </div>
  );
};

export default StatCard;
