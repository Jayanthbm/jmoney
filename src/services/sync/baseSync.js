// src/services/sync/baseSync.js
import { logger } from '../../utils/logger';

/**
 * Checks if the device is currently online.
 */
export const isOnline = async () => {
  return navigator.onLine;
};

/**
 * Shared sync logging utility.
 */
export const syncLog = (entity, message) => {
  logger.log(`[Sync:${entity}] [${new Date().toISOString()}] ${message}`);
};
