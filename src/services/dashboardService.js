import {
  getIncomeExpenseSummary,
  getTransactionsByCategoryForExpense,
  getNetWorth,
  getSpentToday,
} from "./dbQueries";
import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  format,
  differenceInDays,
  getDaysInMonth,
  subMonths,
  subYears,
} from "date-fns";

export const processSummary = (summary) => {
  if (!Array.isArray(summary)) return { income: 0, expense: 0 };
  let inc = 0,
    exp = 0;
  summary.forEach((s) => {
    if (s.type === "Income") inc = s.totalAmount || 0;
    if (s.type === "Expense") exp = s.totalAmount || 0;
  });
  return { income: inc, expense: exp };
};

export const fetchDashboardMetrics = async (userId) => {
  const today = new Date();
  const monthStart = format(startOfMonth(today), "yyyy-MM-dd");
  const todayStr = format(today, "yyyy-MM-dd");

  // Previous Month Comparison
  const prevMonthSameDate = subMonths(today, 1);
  const prevMonthStartStr = format(
    startOfMonth(prevMonthSameDate),
    "yyyy-MM-dd"
  );
  const prevMonthDateStr = format(prevMonthSameDate, "yyyy-MM-dd");

  // Previous Year Comparison
  const prevYearSameDate = subYears(today, 1);
  const prevYearStartStr = format(startOfYear(prevYearSameDate), "yyyy-MM-dd");
  const prevYearDateStr = format(prevYearSameDate, "yyyy-MM-dd");

  const [
    monthSum,
    prevMonthSum,
    yearSum,
    prevYearSum,
    topCats,
    totalNW,
    todayExp,
  ] = await Promise.all([
    getIncomeExpenseSummary(userId, monthStart, todayStr),
    getIncomeExpenseSummary(userId, prevMonthStartStr, prevMonthDateStr),
    getIncomeExpenseSummary(
      userId,
      format(startOfYear(today), "yyyy-MM-dd"),
      todayStr
    ),
    getIncomeExpenseSummary(userId, prevYearStartStr, prevYearDateStr),
    getTransactionsByCategoryForExpense(
      userId,
      monthStart,
      format(endOfMonth(today), "yyyy-MM-dd")
    ),
    getNetWorth(userId),
    getSpentToday(userId, todayStr),
  ]);

  return {
    month: processSummary(monthSum),
    prevMonthComp: processSummary(prevMonthSum),
    year: processSummary(yearSum),
    prevYearComp: processSummary(prevYearSum),
    topCategories: Array.isArray(topCats) ? topCats.slice(0, 3) : [],
    netWorth: totalNW || 0,
    spentToday: todayExp || 0,
  };
};

export const calculateDailyLimit = (metrics) => {
  const today = new Date();
  const monthEnd = endOfMonth(today);
  const remainingDays = differenceInDays(monthEnd, today) + 1;

  const income = metrics.month.income;
  const expenseUntilYesterday = metrics.month.expense - metrics.spentToday;
  const balance = income - expenseUntilYesterday;
  const limit = remainingDays > 0 ? balance / remainingDays : 0;

  const spent = metrics.spentToday;
  const remaining = Math.max(0, limit - spent);

  let remainingPercentage = 100;
  if (spent > 0 || remaining > 0) {
    remainingPercentage = (remaining / (remaining + spent)) * 100;
  }

  return {
    limit: Math.max(0, limit),
    spentToday: spent,
    remainingToday: remaining,
    remainingPercentage: Math.min(100, Math.max(0, remainingPercentage)),
  };
};
