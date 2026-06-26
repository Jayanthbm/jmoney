// src/components/Views/AddTransaction.jsx

import "./SingleTransaction.css";

import { FaPlus, FaTimes } from "react-icons/fa";
import React, { useEffect, useState } from "react";

import Button from "../Button/Button";
import MySelect from "../Select/MySelect";
import { addTransaction } from "../../supabaseData";
import { format } from "date-fns";

const AddTransaction = ({
  incomeCategories,
  expenseCategories,
  payees,
  onClose,
  onTransactionAdded,
}) => {
  const [type, setType] = useState("Expense");
  const [amount, setAmount] = useState("");
  const [timestamp, setTimestamp] = useState(
    format(new Date(), "yyyy-MM-dd'T'HH:mm")
  );
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPayee, setSelectedPayee] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    function setDefaultCategory() {
      if (type === "Expense") {
        // Loop through expenseCategories and find the Catgeory with named 'General'
        const generalCategory = expenseCategories.find(
          (cat) => cat.name === "General"
        );
        setSelectedCategory(generalCategory?.id || null);
      } else if (type === "Income") {
        // Loop through incomeCategories and find the Catgeory with named 'General'
        const generalCategory = incomeCategories.find(
          (cat) => cat.name === "General"
        );
        setSelectedCategory(generalCategory?.id || null);
      } else {
        setSelectedCategory(null);
      }
    }

    setDefaultCategory();
  }, [type, incomeCategories, expenseCategories]);

  const categoryOptions = (
    type === "Expense" ? expenseCategories : incomeCategories
  )?.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  const payeeOptions = payees.map((payee) => ({
    value: payee.id,
    label: payee.name,
  }));

  const handleAdd = async () => {
    if (!amount || !timestamp || !selectedCategory) return;

    setIsAdding(true);

    await addTransaction(
      {
        amount: parseFloat(amount),
        description,
        transaction_timestamp: timestamp,
        category_id: selectedCategory,
        payee_id: selectedPayee,
      },
      { incomeCategories, expenseCategories, payees }
    );

    onTransactionAdded?.();
    onClose?.();
    setIsAdding(false);
  };

  return (
    <div className="single-transaction-container">
      <div className="edit-form">
        <div className="form-group">
          <label>Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="input"
          >
            <option value="Expense">Expense</option>
            <option value="Income">Income</option>
          </select>
        </div>

        <div className="form-group">
          <label>Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input"
          />
        </div>

        <div className="form-group">
          <label>Date</label>
          <input
            type="datetime-local"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            className="input"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="textarea"
            placeholder="Description"
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <MySelect
            options={categoryOptions}
            value={categoryOptions.find(
              (opt) => opt.value === selectedCategory
            )}
            onChange={(selected) => setSelectedCategory(selected.value)}
            isSearchable={true}
          />
        </div>

        <div className="form-group">
          <label>Payee</label>
          <MySelect
            options={payeeOptions}
            value={payeeOptions.find((opt) => opt.value === selectedPayee)}
            onChange={(selected) => setSelectedPayee(selected.value)}
            isSearchable={true}
          />
        </div>

        <div className="button-group">
          <Button
            onClick={onClose}
            text="Cancel"
            icon={<FaTimes />}
            variant="info"
          />

          <Button
            onClick={handleAdd}
            text={isAdding ? "Adding..." : "Add"}
            disabled={isAdding}
            icon={<FaPlus />}
            variant="success"
          />
        </div>
      </div>
    </div>
  );
};

export default AddTransaction;
