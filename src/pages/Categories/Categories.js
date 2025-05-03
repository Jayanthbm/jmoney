import React, { useState } from "react";

const Categories = () => {
  const [categoryType, setCategoryType] = useState("Expense");
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);

  const categoriesToShow =
    categoryType === "Expense" ? expenseCategories : incomeCategories;
  return (
    <div>
      <h1>Categories</h1>
      <p>Categories page content goes here.</p>
    </div>
  );
}
export default Categories;