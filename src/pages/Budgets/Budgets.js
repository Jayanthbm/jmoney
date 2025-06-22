// src/pages/Budgets/Budgets.js

import "./Budgets.css";

import { FaSave, FaWindowClose } from "react-icons/fa";
import React, { useCallback, useEffect, useState } from "react";
import {
  addBudgetInDb,
  deleteBudgetInDb,
  fetchBudgetsData,
  updateBudgetInDb,
} from "../../supabaseData";
import {
  getCategoryCachekeys,
  getSupabaseUserIdFromLocalStorage,
  reCalculateBudget,
} from "../../utils";

import AppLayout from "../../components/Layouts/AppLayout";
import BudgetCard from "../../components/Cards/BudgetCard";
import Button from "../../components/Button/Button";
import { FaCirclePlus } from "react-icons/fa6";
import Select from "react-select";
import { get } from "idb-keyval";
import { useMediaQuery } from "react-responsive";

const Budgets = () => {
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [budgets, setBudgets] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editBudget, setEditBudget] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    interval: "Month",
    start_date: "",
    categories: [],
    logo: "",
  });

  const loadBudgets = useCallback(async () => {
    setLoading(true);
    let budgets = await get("budgets_cache");
    if (budgets) {
      setBudgets(budgets);
    } else {
      budgets = await fetchBudgetsData();
      setBudgets(budgets);
    }
    setLoading(false);
  }, []);

  const loadCategories = useCallback(async () => {
    const { EXPENSE_CACHE_KEY } = getCategoryCachekeys();
    const categories = await get(EXPENSE_CACHE_KEY);
    setCategoryOptions(
      categories.map((cat) => ({ value: cat.id, label: cat.name }))
    );
  }, []);

  useEffect(() => {
    loadBudgets();
    loadCategories();
  }, [loadBudgets, loadCategories]);

  const handleDialogOpen = (budget = null) => {
    setEditBudget(budget);
    setFormData(
      budget || {
        name: "",
        amount: "",
        interval: "Month",
        start_date: "",
        categories: [],
        logo: "",
      }
    );
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditBudget(null);
    setFormData({
      name: "",
      amount: "",
      interval: "Month",
      start_date: "",
      categories: [],
      logo: "",
    });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.amount || !formData.start_date) return;
    const userId = getSupabaseUserIdFromLocalStorage();
    if (!userId) return;

    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
      categories: formData.categories.map((c) => c.value),
    };

    try {
      if (editBudget) {
        await updateBudgetInDb({
          ...payload,
          id: editBudget.id,
          user_id: userId,
        });
      } else {
        await addBudgetInDb(payload);
      }

      handleDialogClose();
      await reCalculateBudget();
      await loadBudgets();
    } catch (e) {
      console.error("Error saving budget:", e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBudgetInDb(id);
      await loadBudgets();
    } catch (e) {
      console.error("Error deleting budget:", e);
    }
  };

  const [orderBy, setOrderBy] = useState("name");

  const sortOptions = [
    { value: "name", label: "Sort by Name" },
    { value: "amount", label: "Sort by Budget Amount" },
    { value: "spent", label: "Sort by Spent" },
    { value: "percentage_spent", label: "Sort by % Spent" },
    { value: "percentage_remaining", label: "Sort by % Remaining" },
    { value: "created_at", label: "Sort by Created Date" },
    { value: "updated_at", label: "Sort by Updated Date" },
  ];

  const sortBudgets = (list) => {
    return [...list]?.sort((a, b) => {
      if (orderBy === "name") return a.name.localeCompare(b.name);
      if (orderBy === "amount") return b.amount - a.amount;
      if (orderBy === "spent") return b.spent - a.spent;
      if (orderBy === "percentage_spent")
        return b.percentage_spent - a.percentage_spent;
      if (orderBy === "percentage_remaining")
        return b.percentage_remaining - a.percentage_remaining;
      if (orderBy === "created_at")
        return new Date(b.created_at) - new Date(a.created_at);
      if (orderBy === "updated_at")
        return new Date(b.updated_at) - new Date(a.updated_at);
      return 0;
    });
  };

  const sortedBudgets = sortBudgets(budgets);

  const refreshData = useCallback(async () => {
    const freshData = await fetchBudgetsData();
    console.log("Goals from Supabase:", freshData);
    setBudgets(freshData);
  }, []);

  return (
    <AppLayout title="Budgets" loading={loading} onRefresh={refreshData}>
      <div className="budgets-header">
        <div className="left-controls">
          <Select
            options={sortOptions}
            value={sortOptions.find((opt) => opt.value === orderBy)}
            onChange={(selected) => setOrderBy(selected.value)}
            isSearchable={false}
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>
        <div className="right-controls">
          <Button
            icon={<FaCirclePlus />}
            text={isMobile ? null : "Add Budget"}
            variant="primary"
            onClick={() => handleDialogOpen()}
          />
        </div>
      </div>
      <div className="budget-card-container">
        {sortedBudgets?.map((budget) => (
          <div className="budget-card-wrapper" key={budget.id}>
            <BudgetCard
              title={budget.name}
              amount={budget.amount}
              interval={budget.interval}
              startDate={budget.start_date}
              logo={budget.logo}
              spent={budget?.spent || 0}
              percentage_spent={budget?.percentage_spent || 0}
              percentage_remaining={budget?.percentage_remaining || 0}
              onEdit={() => handleDialogOpen(budget)}
              onDelete={() => handleDelete(budget.id)}
            />
          </div>
        ))}
      </div>

      {openDialog && (
        <div className="budget-dialog">
          <div className="budget-dialog-content">
            <h3>{editBudget ? "Edit Budget" : "Add Budget"}</h3>
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Amount"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
            />
            <select
              value={formData.interval}
              onChange={(e) =>
                setFormData({ ...formData, interval: e.target.value })
              }
            >
              <option value="Once">Once</option>
              <option value="Day">Day</option>
              <option value="Week">Week</option>
              <option value="Month">Month</option>
              <option value="Year">Year</option>
            </select>
            <input
              type="date"
              placeholder="Start Date"
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Logo URL"
              value={formData.logo}
              onChange={(e) =>
                setFormData({ ...formData, logo: e.target.value })
              }
            />
            <Select
              options={categoryOptions}
              isMulti
              placeholder="Select Categories"
              value={formData.categories}
              onChange={(selected) =>
                setFormData({ ...formData, categories: selected })
              }
              className="react-select-container"
              classNamePrefix="react-select"
            />
            <div className="budget-dialog-actions">
              <Button
                icon={<FaSave />}
                text="Save"
                variant="success"
                onClick={handleSave}
              />
              <Button
                icon={<FaWindowClose />}
                text="Cancel"
                variant="warning"
                onClick={handleDialogClose}
              />
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Budgets;
