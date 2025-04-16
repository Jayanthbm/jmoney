// src/components/Views/SubscriptionBillsView.jsx

import React, { useEffect, useState } from "react";
import Select from "react-select";
import { MdSubscriptions, MdReceiptLong } from "react-icons/md";
import OverviewCard from "../Cards/OverviewCard";
import MyCountUp from "../Charts/MyCountUp";
import { getAllTransactions } from "../../db/transactionDb";
import { getMonthOptions, getYearOptions } from "../../utils";
import "./SubscriptionBillsView.css";
const SubscriptionBillsView = () => {
  const [month, setMonth] = useState({
    value: new Date().getMonth(),
    label: getMonthOptions()[new Date().getMonth()].label,
  });

  const [year, setYear] = useState({
    value: new Date().getFullYear(),
    label: new Date().getFullYear().toString(),
  });

  const [subscriptionsTotal, setSubscriptionsTotal] = useState(0);
  const [billsTotal, setBillsTotal] = useState(0);

  useEffect(() => {
    const fetchAndSummarize = async () => {
      const allTx = await getAllTransactions();
      const filtered = allTx.filter((tx) => {
        const date = new Date(tx.date);
        return (
          date.getMonth() === month.value && date.getFullYear() === year.value
        );
      });
      const subscriptionsFiltered = filtered.filter((tx) => {
        return tx.category_name === "Subscription";
      });

      const billsFiltered = filtered.filter((tx) => {
        return tx.category_name === "Bills";
      });

      const subscriptionsTotal = subscriptionsFiltered.reduce(
        (sum, tx) => sum + tx.amount,
        0
      );
      setSubscriptionsTotal(subscriptionsTotal);
      const billsTotal = billsFiltered.reduce((sum, tx) => sum + tx.amount, 0);
      setBillsTotal(billsTotal);
    };
    fetchAndSummarize();
  }, [year, month]);
  return (
    <div>
      <div className="sub-section-heading">Subscriptions and Bills</div>
      <div className="filters-wrapper">
        <Select
          className="react-select-container"
          classNamePrefix="react-select"
          options={getYearOptions()}
          value={year}
          onChange={(opt) => setYear(opt)}
          isSearchable={false}
        />

        <Select
          className="react-select-container"
          classNamePrefix="react-select"
          options={getMonthOptions()}
          value={month}
          onChange={(opt) => setMonth(opt)}
          isSearchable={false}
        />
      </div>
      <OverviewCard
        title="Subscriptions"
        subtitle={`Total spent on subscriptions in ${month.label}, ${year.label}`}
      >
        <div className="subscription-bills-icon-count-wrapper ">
          <MdSubscriptions className="subscription-bills-overview-icon" />
          <div className="subscription-bills-amount expense-text">
            <MyCountUp end={subscriptionsTotal} />
          </div>
        </div>
      </OverviewCard>

      <OverviewCard
        title="Bills"
        subtitle={`Total spent on bills in ${month.label}, ${year.label}`}
      >
        <div className="subscription-bills-icon-count-wrapper ">
          <MdReceiptLong className="subscription-bills-overview-icon" />
          <div className="subscription-bills-amount expense-text">
            <MyCountUp end={billsTotal} />
          </div>
        </div>
      </OverviewCard>
    </div>
  );
};

export default SubscriptionBillsView;
