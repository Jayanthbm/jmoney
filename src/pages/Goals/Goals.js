// src/pages/Goals/Goals.js

import React, { useCallback, useEffect, useState } from "react";
import { get, set, del } from "idb-keyval";
import Select from "react-select";
import { FaCirclePlus } from "react-icons/fa6";
import { FaSave, FaWindowClose } from "react-icons/fa";
import AppLayout from "../../components/Layouts/AppLayout";
import GoalCard from "../../components/Cards/GoalCard";
import Button from "../../components/Button/Button";
import { supabase } from "../../supabaseClient";
import "./Goals.css";

const CACHE_KEY = "cached_goals";
const CACHE_EXPIRY_DAYS = 20;

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [orderBy, setOrderBy] = useState("created_at");
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    goal_amount: "",
    current_amount: "",
  });

  const sortGoals = (list) => {
    return [...list].sort((a, b) => {
      if (orderBy === "name") return a.name.localeCompare(b.name);
      if (orderBy === "goal_amount") return b.goal_amount - a.goal_amount;
      if (orderBy === "current_amount")
        return b.current_amount - a.current_amount;
      if (orderBy === "progress") {
        const aProg = a.goal_amount ? a.current_amount / a.goal_amount : 0;
        const bProg = b.goal_amount ? b.current_amount / b.goal_amount : 0;
        return bProg - aProg;
      }
      return 0;
    });
  };

  const fetchGoals = useCallback(async (forceRefresh = false) => {
    setLoading(true);

    if (!forceRefresh) {
      const cache = await get(CACHE_KEY);
      if (cache) {
        const { data, timestamp } = cache;
        const now = new Date();
        const expiryMs = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

        if (now - new Date(timestamp) < expiryMs) {
          setGoals(data);
          setLoading(false);
          return;
        }
      }
    }

    const { data, error } = await supabase.from("goals").select("*");

    if (error) {
      console.error("Error fetching goals:", error);
    } else {
      setGoals(data);
      await set(CACHE_KEY, { data, timestamp: new Date() });
    }

    setLoading(false);
  }, []);

  const clearCache = async () => await del(CACHE_KEY);

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

    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user?.id) return;

    const payload = {
      ...formData,
      user_id: user.id,
      goal_amount: parseFloat(formData.goal_amount),
      current_amount: parseFloat(formData.current_amount) || 0,
    };

    const error = editGoal
      ? (
          await supabase
            .from("goals")
            .update(payload)
            .eq("id", editGoal.id)
            .eq("user_id", user.id)
        ).error
      : (await supabase.from("goals").insert([payload])).error;

    if (error) console.error("Error saving goal:", error);
    else {
      await clearCache();
      fetchGoals(true);
      handleDialogClose();
    }
  };

  const handleDelete = async (id) => {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user?.id) return;

    const { error } = await supabase
      .from("goals")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) console.error("Error deleting goal:", error);
    else {
      await clearCache();
      fetchGoals(true);
    }
  };

  const sortedGoals = sortGoals(goals);

  const sortOptions = [
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
      onRefresh={() => fetchGoals(true)}
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
            text="Add"
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
