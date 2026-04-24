import React, { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { Card } from "../components/Common";
import {
  fetchDashboardMetrics,
  calculateDailyLimit,
} from "../services/dashboardService";
import { useAuth } from "../store/AuthContext";
import { formatCurrency } from "../constants";
import { TrendingUp, TrendingDown, Wallet, Calendar } from "lucide-react";

const MetricCard = ({ title, amount, icon: Icon, color }) => (
  <Card className="metric-card">
    <div className="metric-header">
      <span className="metric-title">{title}</span>
      <div
        className="metric-icon"
        style={{ backgroundColor: `${color}20`, color }}
      >
        <Icon size={20} />
      </div>
    </div>
    <div className="metric-amount">{formatCurrency(amount)}</div>
  </Card>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [dailyLimit, setDailyLimit] = useState(null);

  useEffect(() => {
    if (user) {
      fetchDashboardMetrics(user.id).then((data) => {
        setMetrics(data);
        setDailyLimit(calculateDailyLimit(data));
      });
    }
  }, [user]);

  if (!metrics)
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );

  return (
    <Layout>
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.email?.split("@")[0]}</p>
      </div>

      <div className="metrics-grid">
        <MetricCard
          title="Monthly Income"
          amount={metrics.month.income}
          icon={TrendingUp}
          color="#10B981"
        />
        <MetricCard
          title="Monthly Expense"
          amount={metrics.month.expense}
          icon={TrendingDown}
          color="#EF4444"
        />
        <MetricCard
          title="Net Worth"
          amount={metrics.netWorth}
          icon={Wallet}
          color="#3B82F6"
        />
        <MetricCard
          title="Spent Today"
          amount={metrics.spentToday}
          icon={Calendar}
          color="#F59E0B"
        />
      </div>

      {dailyLimit && (
        <Card className="daily-limit-card" style={{ marginTop: "2rem" }}>
          <h3>Daily Spending Limit</h3>
          <div className="limit-progress-container">
            <div className="limit-info">
              <span>
                Remaining: {formatCurrency(dailyLimit.remainingToday)}
              </span>
              <span>Limit: {formatCurrency(dailyLimit.limit)}</span>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${dailyLimit.remainingPercentage}%` }}
              />
            </div>
          </div>
        </Card>
      )}
    </Layout>
  );
};

export default Dashboard;
