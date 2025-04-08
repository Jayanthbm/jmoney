// Goals.js
import React, { useCallback, useEffect, useState } from "react";
import "./Goals.css";
import { supabase } from "./supabaseClient";
import "react-circular-progressbar/dist/styles.css";
import AppLayout from "./components/AppLayout";
import GoalCard from "./components/GoalCard";

import { FaCirclePlus } from "react-icons/fa6";
const CACHE_KEY = "cached_goals";

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

    const cache = localStorage.getItem(CACHE_KEY);
    if (cache && !forceRefresh) {
      const { data, timestamp } = JSON.parse(cache);
      const now = new Date();
      if (now - new Date(timestamp) < 5 * 24 * 60 * 60 * 1000) {
        setGoals(data);
        setLoading(false);
        return;
      }
    }

    const { data, error } = await supabase.from("goals").select("*");

    if (error) console.error("Error fetching goals:", error);
    else {
      setGoals(data);
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ data, timestamp: new Date() })
      );
    }

    setLoading(false);
  }, []);

  const clearCache = () => localStorage.removeItem(CACHE_KEY);

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
      clearCache();
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
      clearCache();
      fetchGoals(true);
    }
  };

  const sortedGoals = sortGoals(goals);

  return (
    <AppLayout
      title="Goals"
      loading={!goals || loading}
      onRefresh={() => {
        fetchGoals(true);
      }}
    >
      <div className="goals-container">
        <div className="goals-header">
          <div className="left-controls">
            <select
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
            >
              <option value="created_at">Sort by Created</option>
              <option value="name">Sort by Name</option>
              <option value="goal_amount">Sort by Goal Amount</option>
              <option value="current_amount">Sort by Current Amount</option>
              <option value="progress">Sort by Progress</option>
            </select>
          </div>
          <div className="right-controls">
            <button
              className="add-btn"
              onClick={() => handleDialogOpen()}
              disabled={loading}
            >
              <FaCirclePlus />
              Add Goal
            </button>
          </div>
        </div>
        <div className="goal-card-container">
          {sortedGoals.map((goal) => {
            const progress = goal.goal_amount
              ? (goal.current_amount / goal.goal_amount) * 100
              : 0;

            return (
              <div className="goal-card-wrapper">
                <GoalCard
                  key={goal.id}
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
                <button onClick={handleSave} className="goal-save-btn">
                  Save
                </button>
                <button onClick={handleDialogClose} className="goal-cancel-btn">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Goals;
