// ABOUTME: Central registry mapping view keys to their mount functions
// ABOUTME: To add a new view: import its mount fn and add one entry to VIEW_REGISTRY

import renderWeeklyApp from '../controller/weeklyController';

export const VIEW_REGISTRY = {
  weekly: renderWeeklyApp,
  // example: monthly: renderMonthlyApp,
};

export const mountView = (viewKey, user) => {
  const fn = VIEW_REGISTRY[viewKey];
  if (!fn) throw new Error(`Unknown view: "${viewKey}"`);
  return fn(user);
};
