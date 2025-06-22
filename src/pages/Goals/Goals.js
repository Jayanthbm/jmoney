// src/pages/Goals/Goals.js

import "./Goals.css";

import { FaSave, FaWindowClose } from "react-icons/fa";
import React, { useCallback, useEffect, useState } from "react";
import {
  addGoalInDb,
  deleteGoalInDb,
  updateGoalInDb,
} from "../../supabaseData";
import {
  getGoalsCacheKey,
  getSupabaseUserIdFromLocalStorage,
  refreshGoalsCache,
} from "../../utils";

import AppLayout from "../../components/Layouts/AppLayout";
import Button from "../../components/Button/Button";
import { FaCirclePlus } from "react-icons/fa6";
import GoalCard from "../../components/Cards/GoalCard";
import Select from "react-select";
import { get } from "idb-keyval";
import { useMediaQuery } from "react-responsive";

const Goals = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [orderBy, setOrderBy] = useState("updated_at");
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    goal_amount: "",
    current_amount: "",
  });

  const sortGoals = (list) => {
    return [...list]?.sort((a, b) => {
      if (orderBy === "name") return a.name.localeCompare(b.name);
      if (orderBy === "goal_amount") return b.goal_amount - a.goal_amount;
      if (orderBy === "current_amount")
        return b.current_amount - a.current_amount;
      if (orderBy === "progress") {
        const aProg = a.goal_amount ? a.current_amount / a.goal_amount : 0;
        const bProg = b.goal_amount ? b.current_amount / b.goal_amount : 0;
        return bProg - aProg;
      }
      if (orderBy === "created_at") {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      if (orderBy === "updated_at") {
        return new Date(b.updated_at) - new Date(a.updated_at);
      }

      return 0;
    });
  };

  const refreshData = useCallback(async () => {
    const freshData = await refreshGoalsCache(true);
    console.log("Goals from Supabase:", freshData);
    setGoals(freshData);
  }, []);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    const { GOALS_CACHE_KEY } = getGoalsCacheKey();
    const goals = await get(GOALS_CACHE_KEY);

    if (goals) {
      setGoals(goals);
    } else {
      await refreshData();
    }

    setLoading(false);
  }, [refreshData]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleDialogOpen = (goal = null) => {
    setEditGoal(goal);
    setFormData(
      goal || {
        name: "",
        logo: "",
        goal_amount: "",
        current_amount: "",
      }
    );
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditGoal(null);
    setFormData({ name: "", logo: "", goal_amount: "", current_amount: "" });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.goal_amount) return;
    const userId = getSupabaseUserIdFromLocalStorage();
    if (!userId) return;

    const payload = {
      ...formData,
      user_id: userId,
      goal_amount: parseFloat(formData.goal_amount),
      current_amount: parseFloat(formData.current_amount) || 0,
    };

    try {
      if (editGoal) {
        await updateGoalInDb({ ...payload, id: editGoal.id });
      } else {
        await addGoalInDb(payload);
      }

      handleDialogClose();
      await fetchGoals();
    } catch (e) {
      console.error("Error saving goal:", e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteGoalInDb(id);
      await fetchGoals();
    } catch (e) {
      console.error("Error deleting goal:", e);
    }
  };

  const sortedGoals = sortGoals(goals);

  const sortOptions = [
    { value: "updated_at", label: "Sort by Updated" },
    { value: "created_at", label: "Sort by Created" },
    { value: "name", label: "Sort by Name" },
    { value: "goal_amount", label: "Sort by Goal Amount" },
    { value: "current_amount", label: "Sort by Current Amount" },
    { value: "progress", label: "Sort by Progress" },
  ];

  return (
    <AppLayout
      title="Goals"
      loading={!goals || loading}
      onRefresh={refreshData}
    >
      <div className="goals-header">
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
            text={isMobile ? null : "Add Goal"}
            variant="primary"
            onClick={() => handleDialogOpen()}
          />
        </div>
      </div>
      <div className="goal-card-container">
        {sortedGoals.map((goal) => {
          const progress = goal.goal_amount
            ? (goal.current_amount / goal.goal_amount) * 100
            : 0;

          return (
            <div className="goal-card-wrapper" key={goal.id}>
              <GoalCard
                title={goal.name}
                progress={progress}
                logo={goal.logo}
                target={goal.goal_amount}
                current={goal.current_amount}
                onEdit={() => handleDialogOpen(goal)}
                onDelete={() => handleDelete(goal.id)}
              />
            </div>
          );
        })}
      </div>

      {openDialog && (
        <div className="goal-dialog">
          <div className="goal-dialog-content">
            <h3>{editGoal ? "Edit Goal" : "Add Goal"}</h3>
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
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
            <input
              type="number"
              placeholder="Goal Amount"
              value={formData.goal_amount}
              onChange={(e) =>
                setFormData({ ...formData, goal_amount: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Current Amount"
              value={formData.current_amount}
              onChange={(e) =>
                setFormData({ ...formData, current_amount: e.target.value })
              }
            />
            <div className="goal-dialog-actions">
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

export default Goals;
