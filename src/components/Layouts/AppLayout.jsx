// src/components/Layouts/AppLayout.jsx

import React from "react";
import PageHeader from "./PageHeader";
import Loading from "./Loading";

const AppLayout = ({ title, children, onRefresh, loading }) => {
  return (
    <div className="container">
      <PageHeader
        title={title}
        showRefreshButton={onRefresh !== undefined}
        onRefresh={onRefresh}
        disabled={loading}
      />
      {loading ? <Loading /> : <>{children}</>}
    </div>
  );
};

export default AppLayout;
