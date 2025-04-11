import React, { useEffect, useState } from "react";
import AppLayout from "./components/AppLayout";

const Reports = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);
  return <AppLayout title="Reports" loading={loading}></AppLayout>;
};

export default Reports;
