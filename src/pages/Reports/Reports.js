// src/pages/Reports/Reports.js

import "./Reports.css";

import {
  MdCalendarToday,
  MdCategory,
  MdCompareArrows,
  MdHome,
  MdPeople,
  MdPerson,
  MdSubscriptions,
} from "react-icons/md";
import React, { useEffect, useState } from "react";

import AppLayout from "../../components/Layouts/AppLayout";
import IncomeExpenseView from "../../components/Views/IncomeExpenseView";
import MonthlyLivingCostsView from "../../components/Views/MonthlyLivingCostsView";
import PayeesView from "../../components/Views/PayeesView";
import ReportCard from "../../components/Cards/ReportCard";
import SubscriptionBillsView from "../../components/Views/SubscriptionBillsView";
import SummaryByPayee from "../../components/Views/SummaryByPayee";
import SummaryView from "../../components/Views/SummaryView";
import YearlySummaryView from "../../components/Views/YearlySummaryView";
import useDetectBack from "../../hooks/useDetectBack";

const reportsList = [
  {
    title: "Monthly Living Costs",
    description: "Track your monthly essential expenses",
    icon: <MdHome size={28} />,
    view: "monthlyLivingCosts",
  },
  {
    title: "Subscription and Bills",
    description: "Keep track of your recurring payments",
    icon: <MdSubscriptions size={28} />,
    view: "subscriptionAndBills",
  },
  {
    title: "Transactions By Payee",
    description: "See the complete history about a payee",
    icon: <MdPerson size={28} />,
    view: "transactionsByPayee",
  },
  {
    title: "Transactions By Category",
    description: "See the complete history about a category",
    icon: <MdCategory size={28} />,
    view: "transactionsByCategory",
  },
  {
    title: "Monthly Summary",
    description: "Review your monthly financial performance",
    icon: <MdCalendarToday size={28} />,
    view: "monthlySummary",
  },
  {
    title: "Income vs Expense",
    description: "Compare how much you earned vs spent",
    icon: <MdCompareArrows size={28} />,
    view: "incomeVsExpense",
  },
  {
    title: "Yearly Summary",
    description: "Review your yearly financial performance",
    icon: <MdCalendarToday size={28} />,
    view: "yearlySummary",
  },
  {
    title: "Payees",
    description: "Analyze transactions by payees",
    icon: <MdPeople size={28} />,
    view: "payees",
  },

];

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("reportList");
  const [title, setTitle] = useState('Reports')

  useEffect(() => {
    setLoading(false);
  }, []);

  useDetectBack(viewMode !== "reportList", () => {
    let isTransactions = JSON.parse(sessionStorage.getItem('transactionsViewMode') || false);
    if (!isTransactions) {
      setViewMode('reportList');
      setTitle('Reports');
    }
  });

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
      case "transactionsByPayee":
        return <SummaryByPayee />
      case "monthlySummary":
        return <YearlySummaryView showMonth={true} />;
      default:
        return null;
    }
  };

  return (
    <AppLayout title={title} loading={loading} onBack={
      viewMode !== 'reportList' ? () => {
        let isTransactions = JSON.parse(sessionStorage.getItem('transactionsViewMode') || false);
        if (!isTransactions) {
          setViewMode('reportList');
          setTitle('Reports');
        } else {
          window.history.back();
        }
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
