// src/pages/Budgets/components/BudgetForm.js

import { FaSave, FaWindowClose } from 'react-icons/fa';
import React, { useEffect, useState } from 'react';

import Button from '../../../components/Button/Button';
import Select from "react-select";

const BudgetForm = ({ initialData, onSave, onCancel, saving, categoryOptions }) => {
   const [formData, setFormData] = useState({
      name: "",
      amount: "",
      interval: "Month",
      start_date: "",
      categories: [],
      logo: "",
   });

   useEffect(() => {
      if (initialData) {
         let new_categories;
         new_categories = categoryOptions.filter((cat) => initialData.categories.includes(cat.value));
         setFormData({
            name: initialData.name || "",
            amount: initialData.amount || "",
            interval: initialData.interval || "Month",
            start_date: initialData.start_date || "",
            categories: new_categories || [],
            logo: initialData.logo || "",
         });
      } else {
         setFormData({
            name: "",
            amount: "",
            interval: "Month",
            start_date: "",
            categories: [],
            logo: "",
         });
      }
   }, [initialData, categoryOptions]);

   const handleSubmit = () => {
      if (!formData.name || !formData.amount || !formData.start_date) {
         alert("Please fill Name, Amount, and Start Date");
         return;
      }
      onSave(formData);
   };

   return (
      <div className="budget-dialog-content">
         <input type="text" placeholder="Name" value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} />

         <input type="number" placeholder="Amount" value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />

         <select value={formData.interval}
            onChange={(e) => setFormData({ ...formData, interval: e.target.value })}>
            <option value="Month">Month</option>
         </select>

         <input type="date" value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />

         <input type="text" placeholder="Logo URL" value={formData.logo}
            onChange={(e) => setFormData({ ...formData, logo: e.target.value })} />

         <Select isMulti options={categoryOptions} placeholder="Select Categories"
            value={formData.categories}
            onChange={(selected) => setFormData({ ...formData, categories: selected })} />

         <div className="budget-dialog-actions">
            <Button icon={<FaSave />} text="Save" variant="success" onClick={handleSubmit} disabled={saving} />
            <Button icon={<FaWindowClose />} text="Cancel" variant="warning" onClick={onCancel} />
         </div>
      </div>
   );
};

export default BudgetForm;