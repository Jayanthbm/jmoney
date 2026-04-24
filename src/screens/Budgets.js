import React from "react";
import { Layout } from "../components/Layout";
import { Card, Button } from "../components/Common";
import { Wallet, Plus } from "lucide-react";

const Budgets = () => {
  return (
    <Layout>
      <div className="screen-header">
        <h1>Budgets</h1>
        <Button>
          <Plus size={18} /> Add
        </Button>
      </div>
      <Card style={{ padding: "2rem", textAlign: "center" }}>
        <Wallet size={48} style={{ margin: "0 auto 1rem", opacity: 0.2 }} />
        <p>Set budgets for different categories to track your spending.</p>
        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
          This feature is coming soon to the PWA version.
        </p>
      </Card>
    </Layout>
  );
};

export default Budgets;
