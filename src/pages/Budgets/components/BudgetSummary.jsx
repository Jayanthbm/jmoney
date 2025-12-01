// src/pages/Budgets/components/BudgetSummary.jsx

import BudgetCard from "../../../components/Cards/BudgetCard";
import Button from "../../../components/Button/Button";
import InlineLoader from "../../../components/Loader/InlineLoader";
import { IoIosFunnel } from "react-icons/io";
import NoDataCard from "../../../components/Cards/NoDataCard";
import React from "react";
import MySkeletion from "../../../components/Loader/MySkeletion";

const BudgetSummary = ({
  loading,
  sortedBudgets,
  refreshData,
  handleDialogOpen,
  handleDelete,
  onBudgetCardClick,
}) => {
  return (
    <div className="budget-card-container">
      {loading ? (
        <MySkeletion count={8} keyName="budget-card" height={80} />
      ) : sortedBudgets?.length < 1 ? (
        <NoDataCard message="Budgets not loaded, Please Refresh or Create New Budget">
          <div>
            <Button
              icon={<IoIosFunnel />}
              text="Refresh Budgets"
              variant="primary"
              onClick={refreshData}
            />
          </div>
        </NoDataCard>
      ) : (
        <>
          {sortedBudgets.map((budget) => (
            <div className="budget-card-wrapper" key={budget.id}>
              <BudgetCard
                title={budget.name}
                amount={budget.amount}
                interval={budget.interval}
                startDate={budget.start_date}
                logo={budget.logo}
                spent={budget.spent || 0}
                percentage_spent={budget.percentage_spent || 0}
                percentage_remaining={budget.percentage_remaining || 0}
                onEdit={() => handleDialogOpen(budget)}
                onDelete={() => handleDelete(budget.id)}
                onClick={() => {
                  onBudgetCardClick(budget);
                }}
              />
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default BudgetSummary;
