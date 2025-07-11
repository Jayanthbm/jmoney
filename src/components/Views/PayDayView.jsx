// src/components/Views/PayDayView.jsx

import "react-calendar/dist/Calendar.css";

import React, { useEffect, useState } from "react";
import { formatDateToDayMonthYear, formatIndianNumber } from "../../utils";

import Button from "../Button/Button";
import Calendar from "react-calendar";
import InlineLoader from "../Loader/InlineLoader";
import { MdToday } from "react-icons/md";
import NoDataCard from "../Cards/NoDataCard";
import TransactionCard from "../Cards/TransactionCard";
import { getAllTransactions } from "../../db/transactionDb";
import { isSameDay } from "date-fns";
import { useMediaQuery } from "react-responsive";

const PayDayView = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [filteredTx, setFilteredTx] = useState([]);
  const [minDate, setMinDate] = useState(null);

  const today = new Date();

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
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
            new Date(b.transaction_timestamp) -
            new Date(a.transaction_timestamp)
        );

      setFilteredTx(txForDate);
      setLoading(false);
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
      <div className="align-right">
        {!isSameDay(selectedDate, today) && (
          <Button onClick={goToToday} text={isMobile ? null : "Today"} icon={<MdToday />} />
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
        {filteredTx?.length > 0 && (
          <div className="summary-amount">{formatIndianNumber(netTotal)}</div>
        )}
      </div>

      {/* Transactions */}
      <div className="transaction-list-wrapper">
        {loading ? (
          <InlineLoader />
        ) : filteredTx?.length === 0 ? (
          <NoDataCard message="No transactions on this date" height="100" width="150" />
        ) : (
          filteredTx?.map((tx) => (
            <TransactionCard key={tx.id} transaction={tx} />
          ))
        )}
      </div>
    </div>
  );
};

export default PayDayView;
