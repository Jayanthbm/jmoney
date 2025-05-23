// src/pages/Budgets/Budgets.js

import React, { useState, useEffect } from "react";
import AppLayout from "../../components/Layouts/AppLayout";

const Budgets = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);
  return <AppLayout title="Budgets" loading={loading}></AppLayout>;
};

export default Budgets;
