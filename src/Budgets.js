import React, { useState } from "react";
import AppLayout from "./components/AppLayout";

const Budgets = () => {
  const [loading, setLoading] = useState(false);
  return <AppLayout title="Budgets" loading={loading}></AppLayout>;
};

export default Budgets;
