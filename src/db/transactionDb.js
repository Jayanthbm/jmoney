// src/db/transactionDb.js

import { createStore, set, get, del, keys } from "idb-keyval";
import { getSupabaseUserIdFromLocalStorage } from "../utils";

// Create a function to get a user-specific store
const getUserStore = () => {
  const userId = getSupabaseUserIdFromLocalStorage();
  return createStore(`transactions-db-${userId}`, "transactions-store");
};

export const storeTransactions = async (transactions) => {
  const txStore = getUserStore();
  for (const tx of transactions) {
    await set(tx.id, tx, txStore);
  }
  const userId = getSupabaseUserIdFromLocalStorage();
  localStorage.setItem(`${userId}_last_transaction_fetch`, Date.now());
};

export const getAllTransactions = async () => {
  const txStore = getUserStore();
  const allKeys = await keys(txStore);
  const allData = await Promise.all(allKeys.map((key) => get(key, txStore)));
  return allData;
};

export const clearTransactions = async () => {
  const txStore = getUserStore();
  const allKeys = await keys(txStore);
  await Promise.all(allKeys.map((key) => del(key, txStore)));
};

export const updateTransactionInDb = async (transaction) => {
  const txStore = getUserStore();
  await set(transaction.id, transaction, txStore);
};

export const deleteTransactionInDb = async (id) => {
  const txStore = getUserStore();
  await del(id, txStore);
};
