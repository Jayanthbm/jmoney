import { supabase } from "../store/AuthContext";
import { db } from "../db/db";

export const isOnline = async () => {
  return navigator.onLine;
};

export const syncService = {
  async pushLocalChanges(userId) {
    if (!(await isOnline())) return;

    // Push unsynced transactions
    const unsyncedTransactions = await db.transactions
      .where({ sync_status: 0, user_id: userId })
      .toArray();

    for (const t of unsyncedTransactions) {
      const { error } = await supabase
        .from("transactions")
        .upsert({ ...t, sync_status: 1 });

      if (!error) {
        await db.transactions.update(t.id, { sync_status: 1 });
      } else {
        console.error("[Sync] Error pushing transaction:", error);
      }
    }

    // Similarly for other tables...
    // For this migration, we'll implement others as needed.
  },
};
