// src/pages/Reports/Reports.js

import React, { useEffect, useState } from "react";
import AppLayout from "../../components/Layouts/AppLayout";
import SummaryView from "../../components/Views/SummaryView";
import YearlySummaryView from "../../components/Views/YearlySummaryView";
import IncomeExpenseView from "../../components/Views/IncomeExpenseView";
import SubscriptionBillsView from "../../components/Views/SubscriptionBillsView";
import PayeesView from "../../components/Views/PayeesView";
import CategoriesView from "../../components/Views/CategoriesView";
import MonthlyLivingCostsView from "../../components/Views/MonthlyLivingCostsView";
import TotalSummaryView from "../../components/Views/TotalSummaryView";
import ReportCard from "../../components/Cards/ReportCard";
import "./Reports.css";

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("reportList");
  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <AppLayout title="Reports" loading={loading}>
      {viewMode !== "reportList" && (
        <button
          className="back-button"
          onClick={() => setViewMode("reportList")}
        >
          ← Reports
        </button>
      )}
      {viewMode === "reportList" && (
        <div className="report-container">
          <div
            className="report-card-wrapper"
            onClick={() => setViewMode("transactionsByCategory")}
          >
            <ReportCard title="Transactions By Category" />
          </div>
          <div
            className="report-card-wrapper"
            onClick={() => setViewMode("yearlySummary")}
          >
            <ReportCard title="Yearly Summary" />
          </div>
          <div
            className="report-card-wrapper"
            onClick={() => setViewMode("incomeVsExpense")}
          >
            <ReportCard title="Income vs Expense" />
          </div>
          <div
            className="report-card-wrapper"
            onClick={() => setViewMode("subscriptionAndBills")}
          >
            <ReportCard title="Subscription and Bills" />
          </div>
          <div
            className="report-card-wrapper"
            onClick={() => setViewMode("payees")}
          >
            <ReportCard title="Payees" />
          </div>
          <div
            className="report-card-wrapper"
            onClick={() => {
              setViewMode("categories");
            }}
          >
            <ReportCard title="Categories" />
          </div>
          <div
            className="report-card-wrapper"
            onClick={() => {
              setViewMode("monthlyLivingCosts");
            }}
          >
            <ReportCard title="Monthly Living Costs" />
          </div>
          <div
            className="report-card-wrapper"
            onClick={() => {
              setViewMode("summary");
            }}
          >
            <ReportCard title="Summary" />
          </div>
        </div>
      )}
      {viewMode === "transactionsByCategory" && (
        <SummaryView title="Transactions By Category" />
      )}
      {viewMode === "yearlySummary" && <YearlySummaryView />}
      {viewMode === "incomeVsExpense" && <IncomeExpenseView />}
      {viewMode === "subscriptionAndBills" && <SubscriptionBillsView />}
      {viewMode === "Payees" && <PayeesView />}
      {viewMode === "Categories" && <CategoriesView />}
      {viewMode === "Monthly Living Costs" && <MonthlyLivingCostsView />}
      {viewMode === "summary" && <TotalSummaryView />}
    </AppLayout>
  );
};

export default Reports;
