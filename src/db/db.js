import Dexie from "dexie";

export const db = new Dexie("jmoney");

db.version(1).stores({
  transactions:
    "++id, amount, description, transaction_timestamp, date, category_id, category_name, category_icon, category_app_icon, payee_id, payee_name, payee_logo, type, user_id, product_link, tid, latitude, longitude, sync_status, created_at, updated_at, deleted",
  categories:
    "++id, name, type, icon, app_icon, user_id, is_living_cost, sync_status",
  payees: "++id, name, logo, user_id, sync_status",
  budgets:
    "++id, name, logo, amount, interval, start_date, categories, user_id, sync_status, deleted",
  goals:
    "++id, name, logo, goal_amount, current_amount, user_id, sync_status, deleted",
  quick_transactions:
    "++id, name, type, amount, category_id, payee_id, description, user_id",
});

export const initDB = async () => {
  // Dexie opens automatically on first access, but we can explicitly open it if needed.
  try {
    await db.open();
    console.log("[DB] Database opened successfully");
  } catch (err) {
    console.error("[DB] Failed to open database:", err);
  }
};
