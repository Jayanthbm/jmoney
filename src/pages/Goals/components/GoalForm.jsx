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
        <div className="input-group">
          <label htmlFor="goal-name">Goal Name</label>
          <input
            id="goal-name"
            type="text"
            placeholder="e.g. Dream Car, Vacation"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="goal-form-input"
          />
        </div>

        <div className="input-group">
          <label htmlFor="goal-logo">Logo URL/Emoji</label>
          <input
            id="goal-logo"
            type="text"
            placeholder="Image URL or Emoji"
            value={formData.logo}
            onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
            className="goal-form-input"
          />
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label htmlFor="goal-amount">Target Amount</label>
            <input
              id="goal-amount"
              type="number"
              placeholder="0.00"
              value={formData.goal_amount}
              onChange={(e) =>
                setFormData({ ...formData, goal_amount: e.target.value })
              }
              className="goal-form-input"
            />
          </div>
          <div className="input-group" style={{ flex: 1 }}>
            <label htmlFor="current-amount">Current Savings</label>
            <input
              id="current-amount"
              type="number"
              placeholder="0.00"
              value={formData.current_amount}
              onChange={(e) =>
                setFormData({ ...formData, current_amount: e.target.value })
              }
              className="goal-form-input"
            />
          </div>
        </div>
      </div>

      <div className="goal-form-actions">
        <Button
          icon={<FaWindowClose />}
          text="Cancel"
          variant="light"
          onClick={onCancel}
        />
        <Button
          icon={<FaSave />}
          text={saving ? "Saving..." : "Save Goal"}
          variant="success"
          onClick={handleSubmit}
          disabled={saving}
        />
      </div>
    </div>
  );
};

export default GoalForm;
