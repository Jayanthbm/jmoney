import React, { useState } from "react";
import AppLayout from "./components/AppLayout";

const Transactions = () => {
  const [loading, setLoading] = useState(false);
  return <AppLayout title="Transactions" loading={loading}></AppLayout>;
};

export default Transactions;
