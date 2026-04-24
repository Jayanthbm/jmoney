import React, { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { Card, Button, Input } from "../components/Common";
import { transactionService } from "../services/transactionService";
import { categoryService } from "../services/categoryService";
import { payeeService } from "../services/payeeService";
import { useAuth } from "../store/AuthContext";
import { useToast } from "../store/ToastContext";
import { formatCurrency, APP_CONFIG } from "../constants";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus } from "lucide-react";

const AddTransaction = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category_id: "",
    payee_id: "",
    type: "Expense",
    date: new Date().toISOString().split("T")[0],
  });
  const [categories, setCategories] = useState([]);
  const [payees, setPayees] = useState([]);

  useEffect(() => {
    if (user) {
      categoryService.getAll(user.id).then(setCategories);
      payeeService.getAll(user.id).then(setPayees);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category_id) return;

    const selectedCat = categories.find((c) => c.id === formData.category_id);
    const selectedPayee = payees.find((p) => p.id === formData.payee_id);

    await transactionService.add({
      ...formData,
      amount: parseFloat(formData.amount),
      category_name: selectedCat?.name,
      category_app_icon: selectedCat?.app_icon,
      payee_name: selectedPayee?.name,
      user_id: user.id,
      transaction_timestamp: new Date().toISOString(),
    });

    navigate("/transactions");
  };

  return (
    <Layout>
      <div className="screen-header">
        <h1>Add Transaction</h1>
      </div>

      <Card className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="type-toggle">
            <button
              type="button"
              className={`toggle-btn ${formData.type === "Expense" ? "active" : ""}`}
              onClick={() => setFormData({ ...formData, type: "Expense" })}
            >
              Expense
            </button>
            <button
              type="button"
              className={`toggle-btn ${formData.type === "Income" ? "active" : ""}`}
              onClick={() => setFormData({ ...formData, type: "Income" })}
            >
              Income
            </button>
          </div>

          <Input
            label={`Amount (${APP_CONFIG.CURRENCY_SYMBOL})`}
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            placeholder="0.00"
            required
          />

          <div className="input-group">
            <label className="input-label">Category</label>
            <select
              className="input-field"
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
              required
            >
              <option value="">Select Category</option>
              {categories
                .filter((c) => c.type === formData.type)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Payee</label>
            <select
              className="input-field"
              value={formData.payee_id}
              onChange={(e) =>
                setFormData({ ...formData, payee_id: e.target.value })
              }
            >
              <option value="">Select Payee</option>
              {payees.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />

          <Input
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="What was this for?"
          />

          <Button type="submit" style={{ width: "100%", marginTop: "1rem" }}>
            Save Transaction
          </Button>
        </form>
      </Card>
    </Layout>
  );
};

export default AddTransaction;
