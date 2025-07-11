// src/pages/Overview/components/RemainingForPeriod.jsx

import MyCountUp from '../../../components/Charts/MyCountUp';
import OverviewCard from '../../../components/Cards/OverviewCard';
import ProgressBar from '../../../components/Charts/ProgressBar';
import PropTypes from 'prop-types';
import React from 'react';

const RemainingForPeriod = ({ data }) => {
  const cardStyles = { cursor: 'default' };

  return (
    <OverviewCard title="Remaining for Period" subtitle={data?.period} customStyles={cardStyles}>
      <div>
        <div className="big-income-text">
          <MyCountUp end={data?.remaining || 0} />
        </div>
        <ProgressBar value={data?.spent_percentage || 0} color="#3ecf8e" />
      </div>
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
