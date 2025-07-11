// src/components/Views/SubscriptionBillsView.jsx

import "./SubscriptionBillsView.css";

import { MdReceiptLong, MdSubscriptions } from "react-icons/md";
import React, { useEffect, useState } from "react";

import InlineLoader from "../Loader/InlineLoader";
import MonthYearSelector from "./MonthYearSelector";
import MyCountUp from "../Charts/MyCountUp";
import OverviewCard from "../Cards/OverviewCard";
import TransactionsMode from "./TransactionsMode";
import { getAllTransactions } from "../../db/transactionDb";
import {
  getMonthOptions,
} from "../../utils";
import { groupBy } from "lodash";

const SubscriptionBillsView = () => {
  const [loading, setLoading] = useState(true);

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
  const [bills, setBills] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [viewMode, setViewMode] = useState("summary");
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    const fetchAndSummarize = async () => {
      setLoading(true);
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

      setSubscriptions(groupBy(subscriptionsFiltered, "date"));
      const subscriptionsTotal = subscriptionsFiltered.reduce(
        (sum, tx) => sum + tx.amount,
        0
      );
      setSubscriptionsTotal(subscriptionsTotal);

      const billsFiltered = filtered.filter((tx) => {
        return tx.category_name === "Bills";
      });

      setBills(groupBy(billsFiltered, "date"));

      const billsTotal = billsFiltered.reduce((sum, tx) => sum + tx.amount, 0);
      setBillsTotal(billsTotal);
      setLoading(false);
    };
    fetchAndSummarize();
  }, [year, month]);

  const handleBack = () => {
    setViewMode("summary");
  };

  return (
    <>
      <MonthYearSelector
        yearValue={year}
        onYearChange={(opt) => setYear(opt)}
        monthValue={month}
        onMonthChange={(opt) => setMonth(opt)}
        disabled={loading}
      />
      {loading ? (
        <InlineLoader />
      ) : (
        <>
          {viewMode === "summary" && (
            <>

              <div
                onClick={() => {
                  if (subscriptionsTotal > 0) {
                    setViewMode("transactions");
                    setSelectedCard("Subscriptions");
                  } else {
                    return;
                  }
                }}
              >
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
              </div>

              <div
                onClick={() => {
                  if (billsTotal > 0) {
                    setViewMode("transactions");
                    setSelectedCard("Bills");
                  } else {
                    return;
                  }
                }}
              >
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
            </>
          )}

          {viewMode === "transactions" && (
            <>
              {/* Toggle Buttons */}
              <div className="toggle-button-group">
                <button
                  onClick={() => setSelectedCard("Subscriptions")}
                  className={selectedCard === "Subscriptions" ? "active" : ""}
                >
                  Subscriptions
                </button>
                <button
                  onClick={() => setSelectedCard("Bills")}
                  className={selectedCard === "Bills" ? "active" : ""}
                >
                  Bills
                </button>
              </div>

              {selectedCard === "Subscriptions" && (
                <TransactionsMode
                  name={"back to list"}
                  amount={subscriptionsTotal}
                  handleBack={handleBack}
                  transactions={subscriptions}
                />
              )}
              {selectedCard === "Bills" && (
                <TransactionsMode
                  name={"back to list"}
                  amount={billsTotal}
                  handleBack={handleBack}
                  transactions={bills}
                />
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

export default SubscriptionBillsView;
