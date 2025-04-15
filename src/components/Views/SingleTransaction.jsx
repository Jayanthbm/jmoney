import React, { useEffect, useState } from "react";
import "./SingleTransaction.css";
import Select from "react-select";
import { formatIndianNumber, formatTimestamp, renderIcon } from "../../utils";
const SingleTransaction = ({
  incomeCategories,
  expenseCategories,
  payees,
  transaction,
}) => {
  const {
    id,
    category_id,
    payee_id,
    amount,
    category_name,
    category_icon,
    description,
    payee_name,
    payee_logo,
    type,
    transaction_timestamp,
  } = transaction;

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [payeeOptions, setPayeeOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(category_id);
  const [selectedPayee, setSelectedPayee] = useState(payee_id);

  const [editMode, setEditMode] = useState(false);
  useEffect(() => {
    if (type === "Expense") {
      setCategoryOptions(
        (expenseCategories || []).map((cat) => ({
          value: cat.id,
          label: cat.name,
        }))
      );
    } else {
      setCategoryOptions(
        (incomeCategories || []).map((cat) => ({
          value: cat.id,
          label: cat.name,
        }))
      );
    }
    setPayeeOptions(
      payees.map((payee) => ({
        value: payee.id,
        label: payee.name,
      }))
    );
    setSelectedCategory(category_id);
    setSelectedPayee(payee_id);
  }, [
    expenseCategories,
    id,
    incomeCategories,
    payees,
    type,
    category_id,
    payee_id,
  ]);
  console.log("category_id", category_id, selectedCategory);
  return (
    <div className="single-transaction">
      <div className="single-transaction-header">
        <div>Edit</div>
        <div>Delete</div>
      </div>
      <div className="single-transaction-filters-wrapper">
        <Select
          options={categoryOptions}
          value={categoryOptions.find((opt) => opt.value === selectedCategory)}
          onChange={(selected) => setSelectedCategory(selected.value)}
          isSearchable={true}
          className="react-select-container"
          classNamePrefix="react-select"
          placeholder="Select Category"
          isDisabled={!editMode}
        />

        <Select
          options={payeeOptions}
          value={payeeOptions.find((opt) => opt.value === selectedPayee)}
          onChange={(selected) => setSelectedPayee(selected.value)}
          isSearchable={true}
          className="react-select-container"
          classNamePrefix="react-select"
          placeholder="Select Payee"
          readonly={true}
          isDisabled={!editMode}
        />
      </div>

      <div className="single-transaction-content">
        <div className="single-transaction-content-left">
          <div className="single-transaction-content-left-icon">
            {renderIcon(category_icon)}
          </div>
          <div className="single-transaction-content-left-details">
            <div className="single-transaction-content-left-details-category-name">
              {category_name}
            </div>
            {description && (
              <div className="single-transaction-content-left-details-description">
                {description}
              </div>
            )}
          </div>
        </div>
        <div className="single-transaction-content-right">
          <div className="single-transaction-content-right-amount">
            {formatIndianNumber(amount)}
          </div>
          <div className="single-transaction-content-right-date">
            {formatTimestamp(transaction_timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleTransaction;
