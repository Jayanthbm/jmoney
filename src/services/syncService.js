// src/services/syncService.js
import { isOnline, syncLog } from './sync/baseSync';
import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';
import { syncTransactions, pushLocalTransactions } from './sync/transactionSync';
import { syncCategories, pushLocalCategories } from './sync/categorySync';
import { syncBudgets, pushLocalBudgets } from './sync/budgetSync';
import { syncGoals, pushLocalGoals } from './sync/goalSync';
import { syncPayees, pushLocalPayees } from './sync/payeeSync';

export { isOnline };

/**
 * Pushes all unsynced local changes to Supabase across all entities.
 */
export const pushLocalChanges = async (userId) => {
  if (!(await isOnline())) return;

  syncLog('Coordinator', 'Checking for unsynced local data...');

  await pushLocalTransactions(userId);
  await pushLocalGoals(userId);
  await pushLocalBudgets(userId);
  await pushLocalCategories(userId);
  await pushLocalPayees(userId);

  syncLog('Coordinator', 'Local data push complete.');
};

let isSyncingData = false;

/**
 * Runs a full synchronization cycle across all entities.
 */
export const runFullSync = async (userId, onProgress) => {
  if (isSyncingData) return;
  isSyncingData = true;
  try {
    if (!(await isOnline())) {
      if (onProgress) onProgress('Offline');
      return;
    }
    syncLog('Coordinator', '*** runFullSync Initiation ***');
    logger.info(`[SyncMaster] Starting full sync for user: ${userId}`);

    if (onProgress) onProgress('Syncing Transactions');
    await syncTransactions(userId, false);

    if (onProgress) onProgress('Syncing Goals');
    await syncGoals(userId);

    if (onProgress) onProgress('Syncing Budgets');
    await syncBudgets(userId);

    if (onProgress) onProgress('Syncing Categories');
    await syncCategories(userId);

    if (onProgress) onProgress('Syncing Payees');
    await syncPayees(userId);

    if (onProgress) onProgress('Finalizing');
    localStorage.setItem(`${STORAGE_KEYS.LAST_SYNC_MASTER}${userId}`, new Date().toISOString());
    syncLog('Coordinator', '*** Full Sync complete ***');
    logger.info(`[SyncMaster] Full sync completed for user: ${userId}`);
  } catch (error) {
    logger.error('[Sync:Coordinator] Full Sync error:', error);
    if (onProgress) onProgress('Error');
  } finally {
    isSyncingData = false;
  }
};

export { 
  syncTransactions, 
  syncGoals, 
  syncBudgets, 
  syncCategories, 
  syncPayees 
};
