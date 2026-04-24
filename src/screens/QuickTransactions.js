import React, { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { Card, Button } from "../components/Common";
import { Zap, Plus } from "lucide-react";

const QuickTransactions = () => {
  return (
    <Layout>
      <div className="screen-header">
        <h1>Quick Transactions</h1>
        <Button>
          <Plus size={18} /> Add
        </Button>
      </div>
      <Card style={{ padding: "2rem", textAlign: "center" }}>
        <Zap size={48} style={{ margin: "0 auto 1rem", opacity: 0.2 }} />
        <p>
          Quick transactions allow you to save templates for frequent expenses.
        </p>
        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
          This feature is coming soon to the PWA version.
        </p>
      </Card>
    </Layout>
  );
};

export default QuickTransactions;
