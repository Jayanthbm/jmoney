// src/pages/Budgets/Budgets.js
import "./Budgets.css";

import { useCallback, useState } from "react";

import AppLayout from "../../components/Layouts/AppLayout";
const Budgets = () => {
  const [loading,setLoading] = useState(false)
  const [viewMode,setViewMode] = useState('summary');
  const refreshData = useCallback(async () => {

  }, []);

  return (
    <AppLayout title="Budgets" loading={loading} onRefresh={refreshData}>
      {viewMode === "summary" && (
       <></>
      )}

      {viewMode === "info" && (
        <></>
      )}

      {viewMode === "transactions" && (
        <></>
      )}
    </AppLayout>
  );
};

export default Budgets;
