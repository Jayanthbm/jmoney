// src/utils/dateUtils.js
import { formatDistanceToNowStrict } from 'date-fns';

export const getRelativeTime = (timestamp) => {
  try {
    let date;
    if (typeof timestamp === 'string' && /^\d+$/.test(timestamp)) {
      date = new Date(parseInt(timestamp, 10));
    } else {
      date = new Date(timestamp);
    }

    if (isNaN(date.getTime())) return '';

    const distance = formatDistanceToNowStrict(date, { addSuffix: true });

    return distance
      .replace(' seconds', 's')
      .replace(' second', 's')
      .replace(' minutes', 'm')
      .replace(' minute', 'm')
      .replace(' hours', 'h')
      .replace(' hour', 'h')
      .replace(' days', 'd')
      .replace(' day', 'd')
      .replace(' months', 'mo')
      .replace(' month', 'mo')
      .replace(' years', 'y')
      .replace(' year', 'y');
  } catch {
    return '';
  }
};
