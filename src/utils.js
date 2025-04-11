import { supabase } from "./supabaseClient";
import { fetchUserOverviewData } from "./supabaseData";

export const formatIndianNumber = (num) => {
  if (typeof num !== "number") return "0";
  return num.toLocaleString("en-IN");
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
  const user = (await supabase.auth.getUser())?.data?.user;
  if (user) {
    await fetchUserOverviewData(user.id);
  }
};

export function formatDateToDayMonthYear(input) {
  const date = new Date(input);
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}
