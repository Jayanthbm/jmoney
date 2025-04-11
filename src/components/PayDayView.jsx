import React, { useEffect, useState } from "react";
import { isSameDay } from "date-fns";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import TransactionCard from "./TransactionCard";
import { getAllTransactions } from "../db";
import { formatIndianNumber, formatDateToDayMonthYear } from "../utils";
import Button from "./Button";

const PayDayView = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [filteredTx, setFilteredTx] = useState([]);
  const [minDate, setMinDate] = useState(null);

  const today = new Date();

  useEffect(() => {
    const fetchTransactions = async () => {
      const allTx = await getAllTransactions();

      if (allTx.length > 0) {
        const sorted = allTx.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        setMinDate(new Date(sorted[0].date));
      }

      const txForDate = allTx
        .filter((tx) => isSameDay(new Date(tx.date), selectedDate))
        .sort(
          (a, b) =>
            new Date(a.transaction_timestamp) -
            new Date(b.transaction_timestamp)
        );

      setFilteredTx(txForDate);
    };

    fetchTransactions();
  }, [selectedDate]);

  const goToToday = () => {
    setSelectedDate(today);
    setActiveStartDate(today);
  };

  // Compute totals
  const incomeTotal = filteredTx
    .filter((tx) => tx.type === "Income")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const expenseTotal = filteredTx
    .filter((tx) => tx.type === "Expense")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netTotal = incomeTotal - expenseTotal;

  return (
    <div>
      <div className="sub-section-heading calendar-header">
        Calendar View
        {!isSameDay(selectedDate, today) && (
          <Button onClick={goToToday} text="Today" />
        )}
      </div>

      {/* Calendar */}
      <div className="calendar-wrapper">
        <Calendar
          value={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          minDate={minDate}
          maxDate={today}
          activeStartDate={activeStartDate}
          onActiveStartDateChange={({ activeStartDate }) =>
            setActiveStartDate(activeStartDate)
          }
        />
      </div>

      {/* Date & Total Info */}
      <div className="date-summary-bar">
        <div className="summary-date">
          {formatDateToDayMonthYear(selectedDate)}
        </div>
        {filteredTx.length > 0 && (
          <div className="summary-amount">₹{formatIndianNumber(netTotal)}</div>
        )}
      </div>

      {/* Transactions */}
      <div className="transaction-list-wrapper">
        {filteredTx.length === 0 ? (
          <div className="no-data-card">No transactions on this date</div>
        ) : (
          filteredTx.map((tx) => (
            <TransactionCard key={tx.id} transaction={tx} />
          ))
        )}
      </div>
    </div>
  );
};

export default PayDayView;
