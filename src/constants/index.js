import { TABLES, SYNC_STATUS } from "./tables";
import { STORAGE_KEYS, SYNC_CONFIG } from "./sync";

export { TABLES, SYNC_STATUS, STORAGE_KEYS, SYNC_CONFIG };

/**
 * Global application constants.
 */
export const APP_CONFIG = {
  NAME: "Jmoney",
  VERSION: "1.2.1",
  CURRENCY_SYMBOL: "₹",
  DEFAULT_LOCALE: "en-IN",
};

/**
 * Formatting utility using constants.
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat(APP_CONFIG.DEFAULT_LOCALE, {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
};
