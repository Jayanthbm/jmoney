import './BudgetInfoCard.css'; // optional: for styles

import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

import Button from '../../../components/Button/Button';
import OverviewCard from '../../../components/Cards/OverviewCard';
import ProgressBar from '../../../components/Charts/ProgressBar';
import React from 'react';

const BudgetInfoCard = ({ budget, selectedYear, selectedMonth, onViewTransations }) => {
   const { amount, percentage_remaining, spent } = budget;
   const now = new Date();
   const isCurrentMonth =
      now.getFullYear() === selectedYear.value && now.getMonth() === selectedMonth.value;

   const daysInMonth = new Date(selectedYear.value, selectedMonth.value + 1, 0).getDate();
   const today = isCurrentMonth ? now.getDate() : daysInMonth;
   const remainingDays = daysInMonth - today + 1; // Added +1 to include current day

   const remaining = Math.max(amount - spent);
   const perDaySpending = isCurrentMonth && remainingDays > 0
      ? +(remaining / remainingDays).toFixed(2)
      : 0;

   const isOverSpent = percentage_remaining < 0;
   const icon = isOverSpent ? <FaExclamationTriangle color="red" /> : <FaCheckCircle color="green" />;
   const statusText = isOverSpent
      ? isCurrentMonth
         ? "OverSpent: You overspent this period"
         : "OverSpent: You overspent this period"
      : isCurrentMonth
         ? "In Budget: You are on budget"
         : "In Budget: Fantastic! You remained on budget";

   const saved = Math.max(amount - spent);
   const progress = percentage_remaining < 0 ? 101 : percentage_remaining;
   return (
      <>
         <OverviewCard customStyles={{ cursor: 'default' }}>
            <div className="budget-info-header">
               {icon} <span className="budget-status-text">{statusText}</span>
            </div>

            <div className="budget-info-grid">
               {isCurrentMonth ? (
                  <>
                     <div className="info-block">
                        <div className="info-title">You can spend</div>
                        <div className="info-amount">₹{perDaySpending}</div>
                        <div className="info-subtitle">per day</div>
                     </div>
                     <div className="info-block">
                        <div className="info-title">Spent so far</div>
                        <div className="info-amount red-text">₹{spent.toFixed(2)}</div>
                        <div className="info-subtitle">TOTAL</div>
                     </div>
                  </>
               ) : (
                  <>
                     <div className="info-block">
                        <div className="info-title">Saved</div>
                        <div className={`info-amount ${saved > 0 ?
                           'green-text' : 'red-text'
                           }`}>₹{saved.toFixed(2)}</div>
                     </div>
                     <div className="info-block">
                        <div className="info-title">Spent</div>
                        <div className="info-amount red-text">₹{spent.toFixed(2)}</div>
                        <div className="info-subtitle">TOTAL</div>
                     </div>
                  </>
               )}
               <div className="info-block">
                  <div className="info-title">Remaining</div>
                  <div className="info-amount">{percentage_remaining.toFixed(2)}%</div>
               </div>
               <div className="info-block">
                  <div className="info-title">Budgeted</div>
                  <div className="info-amount green-text">₹{amount.toFixed(2)}</div>
               </div>
            </div>

            {isCurrentMonth && (
               <div className="remaining-days-text" style={{ marginBottom: 10 }}>{remainingDays} Remaining day{remainingDays !== 1 ? "s" : ""}</div>
            )}

            <ProgressBar value={progress} color={progress < 101 ? '#3ecf8e' : '#ef4444'} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, marginBottom: 5 }}>
               <span className='info-subtitle'>01 {selectedMonth.label} {selectedYear.label}</span>
               <span className='info-subtitle'>{daysInMonth} {selectedMonth.label} {selectedYear.label}</span>
            </div>
         </OverviewCard>
         <div className="info-block">
            <Button text={"View Transactions"} fullWidth={true} variant='info' className="text-center" onClick={onViewTransations} />
         </div>

      </>


   );
};

export default BudgetInfoCard;
