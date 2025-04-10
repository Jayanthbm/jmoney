// src/db.js
import { createStore, set, get, del, keys } from "idb-keyval";

const txStore = createStore("transactions-db", "transactions-store");

export const storeTransactions = async (transactions) => {
  for (const tx of transactions) {
    await set(tx.id, tx, txStore);
  }
};

export const getAllTransactions = async () => {
  const allKeys = await keys(txStore);
  const allData = await Promise.all(allKeys.map((key) => get(key, txStore)));
  return allData;
};

export const clearTransactions = async () => {
  const allKeys = await keys(txStore);
  await Promise.all(allKeys.map((key) => del(key, txStore)));
};
