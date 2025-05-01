// src/components/Views/SubscriptionBillsView.jsx

import React, { useEffect, useState } from "react";
import Select from "react-select";
import { MdSubscriptions, MdReceiptLong } from "react-icons/md";
import { groupBy } from "lodash";
import OverviewCard from "../Cards/OverviewCard";
import MyCountUp from "../Charts/MyCountUp";
import { getAllTransactions } from "../../db/transactionDb";
import {
  formatDateToDayMonthYear,
  getMonthOptions,
  getYearOptions,
} from "../../utils";
import "./SubscriptionBillsView.css";
import { IoIosArrowBack } from "react-icons/io";
import TransactionCard from "../Cards/TransactionCard";
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
  const [bills, setBills] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [viewMode, setViewMode] = useState("summary");
  const [heading, setHeading] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

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
    };
    fetchAndSummarize();
  }, [year, month]);

  return (
    <div>
      {heading && (
        <div className="sub-section-heading">{heading}</div>
      )}

      {viewMode === "summary" && (
        <>
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
          <div
            onClick={() => {
              if (subscriptionsTotal > 0) {
                setViewMode("transactions");
                setHeading("Transactions");
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
                setHeading("Transactions");
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
          <div
            className="back-button-container"
            role="button"
            tabIndex={0}
            onClick={() => {
              setViewMode("summary");
              setHeading(null);
            }}
          >
            <IoIosArrowBack />
            <span className="back-button">Summary</span>
          </div>
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
            <div className="transaction-page-wrapper">
              {Object.entries(subscriptions)?.map(([date, items]) => (
                <div key={date} className="transaction-group">
                  <h2 className="transaction-date-header">
                    {formatDateToDayMonthYear(date)}
                  </h2>
                  <div className="transaction-card-list">
                    {items?.map((tx) => (
                      <TransactionCard key={tx.id} transaction={tx} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {selectedCard === "Bills" && (
            <div className="transaction-page-wrapper">
              {Object.entries(bills).map(([date, items]) => (
                <div key={date} className="transaction-group">
                  <h2 className="transaction-date-header">
                    {formatDateToDayMonthYear(date)}
                  </h2>
                  <div className="transaction-card-list">
                    {items.map((tx) => (
                      <TransactionCard key={tx.id} transaction={tx} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SubscriptionBillsView;
