// src/utils/logger.js

const isDev = import.meta.env.DEV;
const IS_PRODUCTION = !isDev;

const internalLog = (level, ...args) => {
  if (!IS_PRODUCTION || level === 'error') {
    console[level](...args);
  }
};

export const logger = {
  log: (...args) => internalLog('log', ...args),
  info: (...args) => internalLog('log', ...args),
  warn: (...args) => internalLog('warn', ...args),
  error: (...args) => internalLog('error', ...args),
};
