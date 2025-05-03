// src/pages/Reports/Reports.js

import "./Reports.css";

import {
  MdCalendarToday,
  MdCategory,
  MdCompareArrows,
  MdHome,
  MdPeople,
  MdSubscriptions,
} from "react-icons/md";
import React, { useEffect, useState } from "react";

import AppLayout from "../../components/Layouts/AppLayout";
import IncomeExpenseView from "../../components/Views/IncomeExpenseView";
import MonthlyLivingCostsView from "../../components/Views/MonthlyLivingCostsView";
import PayeesView from "../../components/Views/PayeesView";
import ReportCard from "../../components/Cards/ReportCard";
import SubscriptionBillsView from "../../components/Views/SubscriptionBillsView";
import SummaryView from "../../components/Views/SummaryView";
import YearlySummaryView from "../../components/Views/YearlySummaryView";

const reportsList = [
  {
    title: "Transactions By Category",
    description: "See the complete history about a category",
    icon: <MdCategory size={28} />,
    view: "transactionsByCategory",
  },
  {
    title: "Yearly Summary",
    description: "Review your yearly financial performance",
    icon: <MdCalendarToday size={28} />,
    view: "yearlySummary",
  },
  {
    title: "Income vs Expense",
    description: "Compare how much you earned vs spent",
    icon: <MdCompareArrows size={28} />,
    view: "incomeVsExpense",
  },
  {
    title: "Subscription and Bills",
    description: "Keep track of your recurring payments",
    icon: <MdSubscriptions size={28} />,
    view: "subscriptionAndBills",
  },
  {
    title: "Payees",
    description: "Analyze transactions by payees",
    icon: <MdPeople size={28} />,
    view: "payees",
  },
  {
    title: "Monthly Living Costs",
    description: "Track your monthly essential expenses",
    icon: <MdHome size={28} />,
    view: "monthlyLivingCosts",
  },
];

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("reportList");
  const [title, setTitle] = useState('Reports')

  useEffect(() => {
    setLoading(false);
  }, []);

  const renderView = () => {
    switch (viewMode) {
      case "transactionsByCategory":
        return <SummaryView />;
      case "yearlySummary":
        return <YearlySummaryView />;
      case "incomeVsExpense":
        return <IncomeExpenseView />;
      case "subscriptionAndBills":
        return <SubscriptionBillsView />;
      case "payees":
        return <PayeesView />;
      case "monthlyLivingCosts":
        return <MonthlyLivingCostsView />;
      default:
        return null;
    }
  };

  return (
    <AppLayout title={title} loading={loading} onBack={
      viewMode !== 'reportList' ? () => {
        setViewMode('reportList');
        setTitle('Reports');
      } : null
    }>

      {viewMode === "reportList" ? (
        <div className="report-container">
          {reportsList.map((report, index) => (
            <div
              key={report.title}
              className="report-card-wrapper"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => {
                setViewMode(report.view)
                setTitle(report.title)
              }}
            >
              <ReportCard
                icon={report.icon}
                title={report.title}
                description={report.description}
              />
            </div>
          ))}
        </div>
      ) : (
        renderView()
      )}
    </AppLayout>
  );
};

export default Reports;
