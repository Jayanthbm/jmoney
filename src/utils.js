// src/utils.js

import { format } from "date-fns";
import {
  fetchUserOverviewData,
  loadTransactionsFromSupabase,
} from "./supabaseData";

export const formatIndianNumber = (num) => {
  if (typeof num !== "number" || isNaN(num)) return "₹0";
  const isNegative = num < 0;
  const absoluteValue = Math.abs(num);
  const formatted = absoluteValue.toLocaleString("en-IN");

  return isNegative ? `-₹${formatted}` : `₹${formatted}`;
};

// Utility to get relative time
export const getRelativeTime = (timestamp) => {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

export const calculatePayDayInfo = () => {
  const today = new Date();
  const currentDay = today.getDate();
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();

  const remainingDays = daysInMonth - currentDay + 1; // include today
  const remainingDaysPercentage = ((remainingDays / daysInMonth) * 100).toFixed(
    0
  );

  const nextMonthFirst = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const monthName = nextMonthFirst.toLocaleString("en-US", { month: "short" });
  const formattedNextMonth = `${monthName} 01`;

  return {
    date: formattedNextMonth,
    today: currentDay,
    days_in_month: daysInMonth,
    remaining_days: remainingDays,
    remaining_days_percentage: Number(remainingDaysPercentage),
  };
};

export const isCacheExpired = (timestamp, storedDate, expiryHours = 20) => {
  const now = new Date();
  const diffHours = (now - new Date(timestamp)) / 1000 / 60 / 60;
  const today = now.toISOString().split("T")[0];
  return diffHours > expiryHours || storedDate !== today;
};

export const refreshOverviewCache = async () => {
  const userId = getSupabaseUserIdFromLocalStorage();
  if (userId) {
    await fetchUserOverviewData(userId);
  }
};

export function formatDateToDayMonthYear(input) {
  return format(new Date(input), "dd MMM yyyy");
}

export const getMonthOptions = () => {
  return [
    { value: 0, label: "Jan" },
    { value: 1, label: "Feb" },
    { value: 2, label: "Mar" },
    { value: 3, label: "Apr" },
    { value: 4, label: "May" },
    { value: 5, label: "Jun" },
    { value: 6, label: "Jul" },
    { value: 7, label: "Aug" },
    { value: 8, label: "Sep" },
    { value: 9, label: "Oct" },
    { value: 10, label: "Nov" },
    { value: 11, label: "Dec" },
  ];
};

export const getYearOptions = (startYear = 2022) => {
  const currentYear = new Date().getFullYear();
  const years = [];

  for (let year = currentYear; year >= startYear; year--) {
    years.push({ value: year, label: year });
  }

  return years;
};

export const getTopCategoryColors = (count) => {
  const COLOR_PALETTE = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#FF6B6B",
    "#FFD93D",
    "#6BCB77",
    "#4D96FF",
    "#845EC2",
    "#FFC75F",
    "#F9F871",
    "#00C9A7",
    "#C34A36",
    "#B39CD0",
    "#0081CF",
    "#FF8066",
    "#A0E7E5",
    "#F7B801",
    "#7DCE82",
    "#3DCCC7",
    "#A28089",
    "#9D8189",
    "#6A0572",
    "#E4BAD4",
  ];
  return COLOR_PALETTE.slice(0, count);
};

export function getSupabaseUserIdFromLocalStorage() {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (key.endsWith("-auth-token")) {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          const session = JSON.parse(value);
          const userId = session?.user?.id;
          if (userId) {
            return userId;
          }
        }
      } catch (error) {
        console.error(`Failed to parse auth token for key: ${key}`, error);
      }
    }
  }
  return null; // Return null if no user ID found
}

export const refreshTransactionsCache = async (force = false) => {
  const userId = getSupabaseUserIdFromLocalStorage();
  const CACHE_KEY = `${userId}_last_transaction_fetch`;
  const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

  const lastFetch = localStorage.getItem(CACHE_KEY);
  const now = Date.now();

  const isExpired = !lastFetch || now - Number(lastFetch) > EXPIRY_MS;

  if (force || isExpired) {
    await loadTransactionsFromSupabase(); // This function handles updating localStorage
    return true;
  }

  return false;
};
