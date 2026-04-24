import React, { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { Card } from "../components/Common";
import { fetchReportData } from "../services/reportService";
import { useAuth } from "../store/AuthContext";
import { formatCurrency } from "../constants";

const Reports = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState([]);
  const [reportType, setReportType] = useState("monthlyLivingCosts");

  useEffect(() => {
    if (user) {
      const now = new Date();
      fetchReportData(
        user.id,
        reportType,
        "Expense",
        (now.getMonth() + 1).toString().padStart(2, "0"),
        now.getFullYear().toString()
      ).then(setReportData);
    }
  }, [user, reportType]);

  return (
    <Layout>
      <div className="screen-header">
        <h1>Reports</h1>
      </div>

      <div className="report-tabs">
        <button
          className={`tab ${reportType === "monthlyLivingCosts" ? "active" : ""}`}
          onClick={() => setReportType("monthlyLivingCosts")}
        >
          Living Costs
        </button>
        <button
          className={`tab ${reportType === "monthlySummary" ? "active" : ""}`}
          onClick={() => setReportType("monthlySummary")}
        >
          Summary
        </button>
      </div>

      <div className="report-content">
        {reportData.map((item, idx) => (
          <Card
            key={idx}
            className="report-item-card"
            style={{ marginBottom: "1rem" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: "bold" }}>
                {item.category_name || item.type}
              </span>
              <span style={{ color: "var(--danger)", fontWeight: "bold" }}>
                {formatCurrency(item.amount || item.totalAmount || 0)}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </Layout>
  );
};

export default Reports;
