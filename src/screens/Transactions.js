import React, { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { transactionService } from "../services/transactionService";
import { TransactionCard } from "../components/TransactionCard";
import { useAuth } from "../store/AuthContext";
import { Search, Filter } from "lucide-react";
import { Input } from "../components/Common";

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (user) {
      transactionService.getAll().then(setTransactions);
    }
  }, [user]);

  const filteredTransactions = transactions.filter(
    (t) =>
      (t.payee_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.category_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="screen-header">
        <h1>Transactions</h1>
        <div className="header-actions">
          <div className="search-bar">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="transactions-list">
        {filteredTransactions.map((t) => (
          <TransactionCard key={t.id} transaction={t} />
        ))}
      </div>
    </Layout>
  );
};

export default Transactions;
