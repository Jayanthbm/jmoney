// src/pages/Goals/goalUtils.js

export const sortGoals = (list, orderBy) => {
  return [...list]?.sort((a, b) => {
    if (orderBy === "name") return a.name.localeCompare(b.name);
    if (orderBy === "goal_amount") return b.goal_amount - a.goal_amount;
    if (orderBy === "current_amount") return b.current_amount - a.current_amount;
    if (orderBy === "progress") {
      const aProg = a.goal_amount ? a.current_amount / a.goal_amount : 0;
      const bProg = b.goal_amount ? b.current_amount / b.goal_amount : 0;
      return bProg - aProg;
    }
    if (orderBy === "created_at") return new Date(b.created_at) - new Date(a.created_at);
    if (orderBy === "updated_at") return new Date(b.updated_at) - new Date(a.updated_at);
    return 0;
  });
};

export const sortOptions = [
  { value: "updated_at", label: "Sort by Updated" },
  { value: "created_at", label: "Sort by Created" },
  { value: "name", label: "Sort by Name" },
  { value: "goal_amount", label: "Sort by Goal Amount" },
  { value: "current_amount", label: "Sort by Current Amount" },
  { value: "progress", label: "Sort by Progress" },
];
