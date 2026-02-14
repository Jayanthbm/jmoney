// src/pages/Overview/components/RemainingForPeriod.jsx

import MyCountUp from "../../../components/Charts/MyCountUp";
import OverviewCard from "../../../components/Cards/OverviewCard";
import ProgressBar from "../../../components/Charts/ProgressBar";
import PropTypes from "prop-types";
import React from "react";
import MySkeletion from "../../../components/Loader/MySkeletion";

const RemainingForPeriod = ({ data, loading }) => {
  const cardStyles = { cursor: "default" };
  let colorCode = "#3ecf8e";
  let className = "big-income-text";
  if (data?.spent_percentage > 100) {
    colorCode = " #ef4444";
    className = "big-expense-text";
  }
  return (
    <OverviewCard
      title="Remaining for Period"
      subtitle={data?.period || ""}
      customStyles={cardStyles}
    >
      {loading ? (
        <MySkeletion count={2} keyName="remaining-for-period" />
      ) : (
        <div>
          <div className={className}>
            <MyCountUp end={data?.remaining || 0} />
          </div>
          <ProgressBar value={data?.spent_percentage || 0} color={colorCode} />
        </div>
      )}
    </OverviewCard>
  );
};

RemainingForPeriod.propTypes = {
  data: PropTypes.shape({
    period: PropTypes.string,
    remaining: PropTypes.number,
    spent_percentage: PropTypes.number,
  }),
};

export default React.memo(RemainingForPeriod);
