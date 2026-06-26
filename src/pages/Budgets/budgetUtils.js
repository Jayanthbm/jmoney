export const sortBudgets = (list, orderBy) => {
   return [...list]?.sort((a, b) => {
      if (orderBy === "name") return a.name.localeCompare(b.name);
      if (orderBy === "amount") return b.amount - a.amount;
      if (orderBy === "spent") return b.spent - a.spent;
      if (orderBy === "percentage_spent") return b.percentage_spent - a.percentage_spent;
      if (orderBy === "percentage_remaining") return b.percentage_remaining - a.percentage_remaining;
      if (orderBy === "created_at") return new Date(b.created_at) - new Date(a.created_at);
      if (orderBy === "updated_at") return new Date(b.updated_at) - new Date(a.updated_at);
      return 0;
   });
};

export const budgetSortOptions = [
   { value: "name", label: "Sort by Name" },
   { value: "amount", label: "Sort by Budget Amount" },
   { value: "spent", label: "Sort by Spent" },
   { value: "percentage_spent", label: "Sort by % Spent" },
   { value: "percentage_remaining", label: "Sort by % Remaining" }
];