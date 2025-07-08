import "./Goals.css";
import React, { useCallback, useEffect, useState } from "react";
import {
  addGoalInDb,
  deleteGoalInDb,
  updateGoalInDb,
} from "../../supabaseData";
import {
  getSupabaseUserIdFromLocalStorage,
  refreshGoalsCache,
} from "../../utils";

import AppLayout from "../../components/Layouts/AppLayout";
import Button from "../../components/Button/Button";
import { FaCirclePlus } from "react-icons/fa6";
import GoalCard from "./components/GoalCard";
import Select from "react-select";
import { useMediaQuery } from "react-responsive";
import { getCachedGoals } from "../../data/goals";
import MyModal from "../../components/Layouts/MyModal";
import GoalForm from "./components/GoalForm";
import { sortGoals, sortOptions } from "./goalUtils";

const Goals = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [orderBy, setOrderBy] = useState("updated_at");
  const [saving, setSaving] = useState(false);

  const refreshData = useCallback(async () => {
    const freshData = await refreshGoalsCache(true);
    setGoals(freshData);
  }, []);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    const data = await getCachedGoals();
    setGoals(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleDialogOpen = (goal = null) => {
    setEditGoal(goal);
    setIsModalOpen(true);
  };

  const handleDialogClose = () => {
    setIsModalOpen(false);
    setEditGoal(null);
  };

  const handleSaveGoal = async (formData) => {
    if (saving) return;
    setSaving(true);
    try {
      const userId = getSupabaseUserIdFromLocalStorage();
      if (!userId) throw new Error("User not found");

      const payload = {
        ...formData,
        user_id: userId,
        goal_amount: parseFloat(formData.goal_amount) || 0,
        current_amount: parseFloat(formData.current_amount) || 0,
      };

      if (editGoal) {
        await updateGoalInDb({ ...payload, id: editGoal.id });
      } else {
        await addGoalInDb(payload);
      }

      handleDialogClose();
      await fetchGoals();
    } catch (e) {
      console.error("Error saving goal:", e);
      alert("Something went wrong while saving goal.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    try {
      await deleteGoalInDb(id);
      await fetchGoals();
    } catch (e) {
      console.error("Error deleting goal:", e);
      alert("Could not delete goal.");
    }
  };

  const sortedGoals = sortGoals(goals, orderBy);

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
            aria-label="Add new goal"
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
      <MyModal showModal={isModalOpen} onClose={handleDialogClose}>
        <h3>{editGoal ? "Edit Goal" : "Add Goal"}</h3>
        <GoalForm
          initialData={editGoal}
          onSave={handleSaveGoal}
          onCancel={handleDialogClose}
          saving={saving}
        />
      </MyModal>
    </AppLayout>
  );
};

export default Goals;
