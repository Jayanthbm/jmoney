import { db } from "../db/db";

export const transactionService = {
  async getAll() {
    return await db.transactions.where({ deleted: 0 }).reverse().sortBy("date");
  },

  async add(transaction) {
    const id = crypto.randomUUID();
    const newTransaction = {
      ...transaction,
      id,
      sync_status: 0,
      deleted: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await db.transactions.add(newTransaction);
    return newTransaction;
  },

  async update(id, updates) {
    const updatedTransaction = {
      ...updates,
      sync_status: 0,
      updated_at: new Date().toISOString(),
    };
    await db.transactions.update(id, updatedTransaction);
    return updatedTransaction;
  },

  async delete(id) {
    await db.transactions.update(id, {
      deleted: 1,
      sync_status: 0,
      updated_at: new Date().toISOString(),
    });
  },

  async getById(id) {
    return await db.transactions.get(id);
  },
};
