// src/pages/Goals/components/GoalForm.jsx
import "./GoalForm.css";
import React, { useEffect, useState } from "react";
import Button from "../../../components/Button/Button";
import { FaSave, FaWindowClose } from "react-icons/fa";

const GoalForm = ({ initialData, onSave, onCancel, saving }) => {
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    goal_amount: "",
    current_amount: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        logo: initialData.logo || "",
        goal_amount: initialData.goal_amount || "",
        current_amount: initialData.current_amount || "",
      });
    } else {
      setFormData({
        name: "",
        logo: "",
        goal_amount: "",
        current_amount: "",
      });
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (!formData.name || !formData.goal_amount) {
      alert("Please fill Name and Goal Amount");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="goal-form">
      <div className="goal-form-fields">
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="goal-form-input"
        />
        <input
          type="text"
          placeholder="Logo URL"
          value={formData.logo}
          onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
          className="goal-form-input"
        />
        <input
          type="number"
          placeholder="Goal Amount"
          value={formData.goal_amount}
          onChange={(e) => setFormData({ ...formData, goal_amount: e.target.value })}
          className="goal-form-input"
        />
        <input
          type="number"
          placeholder="Current Amount"
          value={formData.current_amount}
          onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
          className="goal-form-input"
        />
      </div>
      <div className="goal-form-actions">
        <Button
          icon={<FaSave />}
          text={saving ? "Saving..." : "Save"}
          variant="success"
          onClick={handleSubmit}
          disabled={saving}
        />
        <Button
          icon={<FaWindowClose />}
          text="Cancel"
          variant="warning"
          onClick={onCancel}
        />
      </div>
    </div>
  );
};

export default GoalForm;
