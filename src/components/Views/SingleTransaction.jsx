// src/components/Views/SingleTransaction.jsx

import "./SingleTransaction.css";

import { FaSave, FaTimes, FaTrash } from "react-icons/fa";
import React, { useState } from "react";
import { deleteTransaction, updateTransaction } from "../../supabaseData";

import Button from "../Button/Button";
import Select from "react-select";

const SingleTransaction = ({
  incomeCategories,
  expenseCategories,
  payees,
  transaction,
  onClose,
  onTransactionUpdated,
}) => {
  const {
    id,
    type,
    amount,
    transaction_timestamp,
    description,
    category_id,
    payee_id,
  } = transaction;

  const [updatedAmount, setUpdatedAmount] = useState(amount);
  const [updatedDescription, setUpdatedDescription] = useState(
    description || ""
  );
  const [updatedTimestamp, setUpdatedTimestamp] = useState(
    transaction_timestamp
  );
  const [selectedCategory, setSelectedCategory] = useState(category_id);
  const [selectedPayee, setSelectedPayee] = useState(payee_id);

  const categoryOptions = (
    type === "Expense" ? expenseCategories : incomeCategories
  )?.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  const payeeOptions = payees?.map((payee) => ({
    value: payee.id,
    label: payee.name,
  }));

  const [isSaving, setIsSaving] = useState(false);
  const handleSave = async () => {
    setIsSaving(true);
    const updatedData = {
      amount: updatedAmount,
      description: updatedDescription,
      transaction_timestamp: updatedTimestamp,
      category_id: selectedCategory,
      payee_id: selectedPayee,
    };

    // Optimistic UI update
    onTransactionUpdated?.();
    onClose?.();

    await updateTransaction(id, updatedData, {
      incomeCategories,
      expenseCategories,
      payees,
    });
    setIsSaving(false);
  };

  const handleDelete = async () => {
    const confirm = window.confirm(
      "Are you sure you want to delete this transaction?"
    );
    if (!confirm) return;
    await deleteTransaction(id);
    onTransactionUpdated?.();
    onClose?.();
  };

  return (
    <div className="single-transaction-container">
      <div className="edit-form">
        <div className="form-group">
          <label>Amount</label>
          <input
            type="number"
            value={updatedAmount}
            onChange={(e) => setUpdatedAmount(e.target.value)}
            className="input"
          />
        </div>

        <div className="form-group">
          <label>Date</label>
          <input
            type="datetime-local"
            value={updatedTimestamp.slice(0, 16)}
            onChange={(e) => setUpdatedTimestamp(e.target.value)}
            className="input"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={updatedDescription}
            onChange={(e) => setUpdatedDescription(e.target.value)}
            className="textarea"
            placeholder="Description"
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <Select
            options={categoryOptions}
            value={categoryOptions.find(
              (opt) => opt.value === selectedCategory
            )}
            onChange={(selected) => setSelectedCategory(selected.value)}
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

        <div className="form-group">
          <label>Payee</label>
          <Select
            options={payeeOptions}
            value={payeeOptions.find((opt) => opt.value === selectedPayee)}
            onChange={(selected) => setSelectedPayee(selected.value)}
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

        <div className="button-group">
          <Button
            onClick={handleSave}
            text={isSaving ? "Saving..." : "Save"}
            disabled={isSaving}
            icon={<FaSave />}
            variant="success"
          />
          <Button
            onClick={onClose}
            text="Cancel"
            icon={<FaTimes />}
            variant="info"
          />
        </div>
        <div className="delete-btn-group">
          <Button
            onClick={handleDelete}
            text="Delete"
            icon={<FaTrash />}
            variant="danger"
            fullWidth
          />
        </div>
      </div>
    </div>
  );
};

export default SingleTransaction;
