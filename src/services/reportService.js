import {
  getReportMonthlyLivingCosts,
  getIncomeExpenseSummary,
} from "./dbQueries";
import { db } from "../db/db";
import {
  format,
  endOfMonth,
  startOfMonth,
  subMonths,
  isSameMonth,
} from "date-fns";

export const fetchReportData = async (
  userId,
  reportType,
  type,
  monthStr,
  year,
  useFullPreviousPeriod = false
) => {
  let currentData = [];
  try {
    currentData = await fetchBaseReportData(
      userId,
      reportType,
      type,
      monthStr,
      year
    );
  } catch (err) {
    console.error("Report Base Load Failed:", err);
    return [];
  }

  // Simplified comparison logic for migration (can be expanded later)
  return currentData;
};

const fetchBaseReportData = async (
  userId,
  reportType,
  type,
  monthStr,
  year
) => {
  switch (reportType) {
    case "monthlyLivingCosts":
      return await getReportMonthlyLivingCosts(userId, monthStr, year);
    case "monthlySummary":
      return await getIncomeExpenseSummary(
        userId,
        `${year}-${monthStr}-01`,
        format(endOfMonth(new Date(year, monthStr - 1)), "yyyy-MM-dd")
      );
    default:
      return [];
  }
};
