import { db } from "../db/db";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

export const getIncomeExpenseSummary = async (userId, startDate, endDate) => {
  const transactions = await db.transactions
    .where("user_id")
    .equals(userId)
    .and((t) => t.date >= startDate && t.date <= endDate && t.deleted === 0)
    .toArray();

  const summary = transactions.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + (t.amount || 0);
    return acc;
  }, {});

  return Object.entries(summary).map(([type, totalAmount]) => ({
    type,
    totalAmount,
  }));
};

export const getTransactionsByCategoryForExpense = async (
  userId,
  startDate,
  endDate
) => {
  const transactions = await db.transactions
    .where("user_id")
    .equals(userId)
    .and(
      (t) =>
        t.type === "Expense" &&
        t.date >= startDate &&
        t.date <= endDate &&
        t.deleted === 0
    )
    .toArray();

  const summary = transactions.reduce((acc, t) => {
    acc[t.category_name] = (acc[t.category_name] || 0) + (t.amount || 0);
    return acc;
  }, {});

  return Object.entries(summary)
    .map(([category_name, totalAmount]) => ({ category_name, totalAmount }))
    .sort((a, b) => b.totalAmount - a.totalAmount);
};

export const getNetWorth = async (userId) => {
  const transactions = await db.transactions
    .where("user_id")
    .equals(userId)
    .and((t) => t.deleted === 0)
    .toArray();

  return transactions.reduce((acc, t) => {
    if (t.type === "Income") return acc + t.amount;
    if (t.type === "Expense") return acc - t.amount;
    return acc;
  }, 0);
};

export const getSpentToday = async (userId, todayStr) => {
  const transactions = await db.transactions
    .where("user_id")
    .equals(userId)
    .and((t) => t.type === "Expense" && t.date === todayStr && t.deleted === 0)
    .toArray();

  return transactions.reduce((acc, t) => acc + t.amount, 0);
};

export const getReportMonthlyLivingCosts = async (userId, month, year) => {
  const livingCostsCategories = await db.categories
    .where("user_id")
    .equals(userId)
    .and((c) => c.is_living_cost === 1)
    .toArray();
  const livingCategoryIds = new Set(livingCostsCategories.map((c) => c.id));

  const transactions = await db.transactions
    .where("user_id")
    .equals(userId)
    .and((t) => {
      const tDate = new Date(t.date);
      const tMonth = (tDate.getMonth() + 1).toString().padStart(2, "0");
      const tYear = tDate.getFullYear().toString();
      return (
        t.type === "Expense" &&
        t.deleted === 0 &&
        tMonth === month &&
        tYear === year &&
        livingCategoryIds.has(t.category_id)
      );
    })
    .toArray();

  const summary = transactions.reduce((acc, t) => {
    const key = t.category_name;
    if (!acc[key])
      acc[key] = {
        category_id: t.category_id,
        category_name: t.category_name,
        category_app_icon: t.category_app_icon,
        amount: 0,
      };
    acc[key].amount += t.amount;
    return acc;
  }, {});

  return Object.values(summary).sort((a, b) => b.amount - a.amount);
};
