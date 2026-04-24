import React from "react";
import { Layout } from "../components/Layout";
import { Card, Button } from "../components/Common";
import { Target, Plus } from "lucide-react";

const Goals = () => {
  return (
    <Layout>
      <div className="screen-header">
        <h1>Goals</h1>
        <Button>
          <Plus size={18} /> Add
        </Button>
      </div>
      <Card style={{ padding: "2rem", textAlign: "center" }}>
        <Target size={48} style={{ margin: "0 auto 1rem", opacity: 0.2 }} />
        <p>Set and track your financial goals.</p>
        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
          This feature is coming soon to the PWA version.
        </p>
      </Card>
    </Layout>
  );
};

export default Goals;
