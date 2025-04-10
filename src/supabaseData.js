import { storeTransactions } from "./db";
import { supabase } from "./supabaseClient";
export const loadTransactionsFromSupabase = async () => {
  const CHUNK_SIZE = 1000;
  const user = await supabase.auth.getUser();
  let allData = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase.rpc("get_user_transactions", {
      uid: user.data.user.id,
      search_term: "",
      limit_count: CHUNK_SIZE,
      offset_count: offset,
    });

    if (error) {
      console.error("Error fetching transactions:", error);
      break;
    }

    if (data.length === 0) {
      hasMore = false;
      break;
    }

    await storeTransactions(data);
    allData = [...allData, ...data];
    offset += CHUNK_SIZE;
  }

  return allData;
};
