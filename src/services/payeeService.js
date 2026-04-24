import { db } from "../db/db";
import { storageService } from "./storageService";

const VIEW_MODE_KEY = (userId) => `@payee_view_mode_${userId}`;

export const payeeService = {
  async getAll(userId) {
    return await db.payees.where({ user_id: userId }).toArray();
  },

  async add(userId, name, logo) {
    const newPayee = {
      id: crypto.randomUUID(),
      name: name.trim(),
      logo: logo.trim() || "",
      user_id: userId,
      sync_status: 0,
    };
    await db.payees.add(newPayee);
    return newPayee;
  },

  async getViewMode(userId) {
    return (await storageService.getItem(VIEW_MODE_KEY(userId))) || "grid";
  },

  async saveViewMode(userId, mode) {
    await storageService.setItem(VIEW_MODE_KEY(userId), mode);
  },
};
