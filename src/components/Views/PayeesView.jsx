// src/components/Views/PayeesView.jsx
import "./PayeesView.css";

import React, { useEffect, useState, useCallback } from "react";
import { formatDateToDayMonthYear, formatIndianNumber, groupAndSortTransactions } from "../../utils";
import { IoIosArrowBack } from "react-icons/io";
import Loading from "../Layouts/Loading";
import TransactionCard from "../Cards/TransactionCard";
import { getAllTransactions } from "../../db/transactionDb";
import { groupBy } from "lodash";
import { MdClose } from "react-icons/md";
import Fuse from "fuse.js";
import { debounce } from "lodash";
import NoDataCard from "../Cards/NoDataCard";

const PayeesView = () => {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("summary");
  const [payees, setPayees] = useState([]);
  const [groupedPayees, setGroupedPayees] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedPayee, setSelectedPayee] = useState(null);
  const [selectedPayeeTotal, setSelectedPayeeTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [fuse, setFuse] = useState(null);

  useEffect(() => {
    const fetchAndSummarize = async () => {
      setLoading(true);
      const allTx = await getAllTransactions();
      const filtered = allTx.filter((tx) => tx.payee_name);
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
      // Create Fuse instance for fuzzy search
      setFuse(new Fuse(summarizedPayees, {
        keys: ['name'],
        threshold: 0.3
      }));
      setLoading(false);
    };
    fetchAndSummarize();
  }, []);

  const handlePayeeClick = (payee) => {
    setSelectedPayee(payee.name);
    setSelectedPayeeTotal(payee.amount);
    setTransactions(groupAndSortTransactions(payee.transactions));
    setViewMode("transactions");
  };

  // Debounced fuzzy search
  const debouncedFuzzyFilter = useCallback(
    debounce((query, fuseInstance, originalPayees) => {
      if (!query) {
        setGroupedPayees(originalPayees);
      } else if (fuseInstance) {
        const results = fuseInstance.search(query);
        setGroupedPayees(results.map(result => result.item));
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedFuzzyFilter(search, fuse, payees);
    return () => debouncedFuzzyFilter.cancel();
  }, [search, fuse, payees, debouncedFuzzyFilter]);

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <>
          {viewMode === "summary" && (
            <>
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Search Payees"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-bar"
                  spellCheck={false}
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
          {viewMode === "transactions" && (
            <>
              <div
                className="back-button-container"
                role="button"
                tabIndex={0}
                onClick={() => {
                  setViewMode("summary");

                  setTransactions([]);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setViewMode("summary");

                    setTransactions([]);
                  }
                }}
              >
                <IoIosArrowBack />
                <span className="back-button">Summary</span>
              </div>
              <div className="date-summary-bar">
                <div className="summary-date">{selectedPayee}</div>
                <div className="summary-amount">
                  {formatIndianNumber(selectedPayeeTotal)}
                </div>
              </div>
              <div className="transaction-page-wrapper">
                {Object.entries(transactions)?.map(([date, items]) => (
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
            </>
          )}
        </>
      )}
    </div>
  );
};

export default PayeesView;
