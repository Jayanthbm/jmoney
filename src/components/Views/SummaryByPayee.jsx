import React, { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { formatDateToDayMonthYear, formatIndianNumber, getMonthOptions, getYearOptions, groupAndSortTransactions } from "../../utils";
import Select from "react-select";
import InlineLoader from "../Layouts/InlineLoader";
import NoDataCard from "../Cards/NoDataCard";
import { getAllTransactions } from "../../db/transactionDb";
import { groupBy } from "lodash";
import { IoIosArrowBack } from "react-icons/io";
import TransactionCard from "../Cards/TransactionCard";

const SummaryByPayee = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState("Expense");

  const [month, setMonth] = useState({
    value: new Date().getMonth(),
    label: getMonthOptions()[new Date().getMonth()].label,
  });
  const [year, setYear] = useState({
    value: new Date().getFullYear(),
    label: new Date().getFullYear().toString(),
  });

  const [payeeSummary, setPayeeSummary] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [viewMode, setViewMode] = useState("summary");

  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchAndSummarize = async () => {
      setLoading(true);

      const allTx = await getAllTransactions();
      let filtered = allTx.filter((tx) => {
        const date = new Date(tx.date);
        return (
          tx.payee_id !== null &&
          tx.type === type &&
          date.getMonth() === month.value &&
          date.getFullYear() === year.value
        );
      });

      const total = filtered.reduce((sum, tx) => sum + tx.amount, 0);

      const summaryMap = {};

      filtered.forEach((tx) => {
        if (!summaryMap[tx.payee_name]) {
          summaryMap[tx.payee_name] = {
            amount: 0,
            icon: "",
            transactions: [],
          };
        }
        summaryMap[tx.payee_name].amount += tx.amount;
        summaryMap[tx.payee_name].transactions.push(tx);
      });

      const summaryArray = Object.entries(summaryMap)
        .map(([payee, data]) => ({
          name: payee,
          amount: data.amount,
          percentage: Math.round((data.amount / total) * 100),
          type: type,
          transactions: data.transactions,
        }))
        .sort((a, b) => b.percentage - a.percentage);

      setPayeeSummary(summaryArray);
      setLoading(false);
    }
    fetchAndSummarize();
  }, [type, month, year])

  return (
    <div>
      {viewMode === "summary" && (
        <>
          {/* Toggle Buttons */}
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

          {/* Month/Year Selectors */}
          <div className="filters-wrapper">
            <Select
              className="react-select-container"
              classNamePrefix="react-select"
              options={getYearOptions()}
              value={year}
              onChange={(opt) => setYear(opt)}
            />

            <Select
              className="react-select-container"
              classNamePrefix="react-select"
              options={getMonthOptions()}
              value={month}
              onChange={(opt) => setMonth(opt)}
            />
          </div>

          {/* Payee Summary */}
          <>
            {loading ? (
              <InlineLoader text="Loading Payees" />
            ) : payeeSummary?.length === 0 ? (
              <NoDataCard message="No transactions" height="150" width="200" />
            ) : (
              <div className="payee-summary-wrapper">
                {payeeSummary?.map((payee) => (
                  <div
                    key={payee.name}
                    className="payee-summary-card"
                    onClick={() => {
                      setTransactions(
                        groupAndSortTransactions(payee.transactions)
                      );
                      setViewMode("transactions");
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="payee-details">
                      <div className="payee-name">{payee.name}</div>
                      <div style={{
                        display: "flex",
                        flexDirection:'column',
                        alignItems:'flex-end'

                      }}>
                        <div
                          className={`payee-amount ${type === "Income" ? "green-text" : "red-text"
                            }`}
                        >
                          {formatIndianNumber(Math.abs(payee.amount))}

                        </div>
                        <div className="transaction-percentage">{payee.percentage}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
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
              setTransactions({});
            }}
          >
            <IoIosArrowBack />
            <span className="back-button">Summary</span>
          </div>

          <div className="transaction-page-wrapper">
            {Object.entries(transactions).map(([date, items]) => (
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
        </>
      )}
    </div>
  )
}

export default SummaryByPayee;