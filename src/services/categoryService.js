import { db } from "../db/db";
import { storageService } from "./storageService";

const VIEW_MODE_KEY = (userId) => `@category_view_mode_${userId}`;
const LAST_SYNC_KEY = (userId) => `@last_sync_categories_${userId}`;

export const categoryService = {
  async getAll(userId) {
    return await db.categories.where({ user_id: userId }).toArray();
  },

  async add(userId, name, type, appIcon) {
    const newCategory = {
      id: crypto.randomUUID(),
      name: name.trim(),
      type,
      app_icon: appIcon.trim() || "category",
      user_id: userId,
      sync_status: 0,
      is_living_cost: 0,
    };
    await db.categories.add(newCategory);
    return newCategory;
  },

  async getViewMode(userId) {
    return (await storageService.getItem(VIEW_MODE_KEY(userId))) || "grid";
  },

  async saveViewMode(userId, mode) {
    await storageService.setItem(VIEW_MODE_KEY(userId), mode);
  },
};
