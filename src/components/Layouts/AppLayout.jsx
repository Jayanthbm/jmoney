// src/components/Layouts/AppLayout.jsx

import Loading from "../Loader/Loading";
import PageHeader from "./PageHeader";
import React from "react";

const AppLayout = ({ title, children, onRefresh, loading, onBack }) => {
  return (
    <div className="container">
      <PageHeader
        title={title}
        showRefreshButton={onRefresh !== undefined}
        onRefresh={onRefresh}
        disabled={loading}
        onBack={onBack}
      />
      {loading ? <Loading /> : <>{children}</>}
    </div>
  );
};

export default AppLayout;
