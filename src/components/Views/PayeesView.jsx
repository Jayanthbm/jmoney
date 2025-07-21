// src/components/Views/PayeesView.jsx
import "./PayeesView.css";

import React, { useEffect, useState } from "react";
import { formatIndianNumber, groupAndSortTransactions } from "../../utils";

import AppLayout from "../Layouts/AppLayout";
import Fuse from "fuse.js";
import InlineLoader from "../Loader/InlineLoader";
import { MdClose } from "react-icons/md";
import NoDataCard from "../Cards/NoDataCard";
import TransactionsMode from "./TransactionsMode";
import { debounce } from "lodash";
import { getAllTransactions } from "../../db/transactionDb";
import { groupBy } from "lodash";

const PayeesView = ({ title, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("summary");
  const [payees, setPayees] = useState([]);
  const [groupedPayees, setGroupedPayees] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedPayee, setSelectedPayee] = useState(null);
  const [selectedPayeeTotal, setSelectedPayeeTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [fuse, setFuse] = useState(null);
  const [type, setType] = useState("Expense");

  useEffect(() => {
    const fetchAndSummarize = async () => {
      setLoading(true);
      const allTx = await getAllTransactions();
      const filtered = allTx.filter((tx) => tx.payee_name && tx.type === type);
      const grouped = groupBy(filtered, (tx) => tx.payee_name);

      const summarizedPayees = Object.entries(grouped)?.map(
        ([payeeName, txs]) => {
          const amount = txs.reduce((sum, tx) => {
            return tx.type === "Income" ? sum + tx.amount : sum - tx.amount;
          }, 0);

          return {
            name: payeeName,
            amount,
            transactions: txs,
          };
        }
      );

      summarizedPayees.sort((a, b) => a.name.localeCompare(b.name));

      setPayees(summarizedPayees);
      setGroupedPayees(summarizedPayees);

      // Initialize Fuse for fuzzy search
      const fuseInstance = new Fuse(summarizedPayees, {
        keys: ['name'],
        threshold: 0.3
      });
      setFuse(fuseInstance);

      setLoading(false);
    };
    fetchAndSummarize();
  }, [type]);

  useEffect(() => {
    if (!fuse) return;

    const handler = debounce((query) => {
      if (!query) {
        setGroupedPayees(payees);
      } else {
        const results = fuse.search(query);
        setGroupedPayees(results.map(r => r.item));
      }
    }, 300);

    handler(search);

    return () => handler.cancel();
  }, [search, fuse, payees]);

  const handlePayeeClick = (payee) => {
    setSelectedPayee(payee.name);
    setSelectedPayeeTotal(payee.amount);
    setTransactions(groupAndSortTransactions(payee.transactions));
    setViewMode("transactions");
  };

  const handleBack = () => {
    setViewMode("summary");
    setTransactions([]);
  };

  return (
    <>
      {viewMode === "summary" && (
        <AppLayout title={title} onBack={onBack}>
          {loading ? (
            <InlineLoader />
          ) : (
            <>
              <div className="toggle-button-group">
                <button
                  onClick={() => setType("Expense")}
                  className={type === "Expense" ? "active" : ""}
                >
                  Expense
                </button>
                <button
                  onClick={() => setType("Income")}
                  className={type === "Income" ? "active" : ""}
                >
                  Income
                </button>
              </div>
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    placeholder="Search Payees"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-bar"
                    spellCheck={false}
                    aria-label="Search payees"
                    disabled={loading}
                  />
                  {search && (
                    <span
                      className="search-clear-icon"
                      onClick={() => setSearch("")}
                      role="button"
                      tabIndex={0}
                      aria-label="Clear search"
                      title="Clear search"
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSearch("")}
                    >
                      <MdClose />
                    </span>
                  )}
                </div>
                <div className="payee-summary-wrapper">
                {groupedPayees?.length === 0 && (
                  <NoDataCard message="No Payee found" height="150" width="200" />
                )}
                {groupedPayees?.map((payee) => (
                  <div
                    key={payee.name}
                    className="payee-summary-card"
                    onClick={() => handlePayeeClick(payee)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        handlePayeeClick(payee);
                    }}
                    aria-label={`View transactions for ${payee.name}`}
                  >
                    <div className="payee-details">
                      <div className="payee-name">{payee.name}</div>
                      <div
                        className={`payee-amount ${payee.amount >= 0 ? "green-text" : "red-text"
                          }`}
                      >
                        {payee.amount < 0 ? "-" : ""}
                        {formatIndianNumber(Math.abs(payee.amount))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </AppLayout>
      )}
      {viewMode === "transactions" && (
        <AppLayout title={title} onBack={handleBack}>
          <TransactionsMode
            name={selectedPayee}
            amount={selectedPayeeTotal}
            transactions={transactions}
          />
        </AppLayout>
      )}
    </>
  );
};

export default PayeesView;
