// src/pages/Overview/components/TopCategories.jsx

import CustomDonutChart from '../../../components/Charts/CustomDonutChart';
import NoDataCard from '../../../components/Cards/NoDataCard';
import OverviewCard from '../../../components/Cards/OverviewCard';
import PropTypes from 'prop-types';
import React from 'react';
import { formatIndianNumber } from '../../../utils';

const CATEGORY_COLORS = ["#3b82f6", "#10b981", "#9ca3af"];

const TopCategories = ({ data }) => {
  const topCategories = data?.topCategories || [];
  const period = data?.remainingForPeriod?.period || "";

  return (
    <OverviewCard title="Top Categories" subtitle={period}>
      {topCategories.length > 0 ? (
        <div className="top-categories-donut">
          {/* Labels */}
          <div className="category-labels">
            {topCategories.map((cat, index) => (
              <div key={index} className="category-label-item">
                <span
                  className="category-dot"
                  style={{ backgroundColor: CATEGORY_COLORS[index] }}
                />
                <div className="category-text">
                  <div className="category-name">{cat.name}</div>
                  <div className="category-value">
                    {formatIndianNumber(cat?.amount || 0)} | {cat?.percentage || 0}%
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Donut Chart */}
          <div className="category-donut-chart">
            <CustomDonutChart
              data={topCategories.map((cat) => ({
                value: cat?.percentage,
              }))}
              colors={CATEGORY_COLORS}
            />
          </div>
        </div>
      ) : (
        <NoDataCard message="No data available" height="100" width="150" />
      )}
    </OverviewCard>
  );
};

TopCategories.propTypes = {
  data: PropTypes.shape({
    remainingForPeriod: PropTypes.shape({
      period: PropTypes.string,
    }),
    topCategories: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        amount: PropTypes.number,
        percentage: PropTypes.number,
      })
    ),
  }),
};

export default React.memo(TopCategories);
