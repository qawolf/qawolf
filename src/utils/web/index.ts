import { formatArgument, interceptConsoleLogs } from './interceptConsoleLogs';

const web = {
  formatArgument,
  interceptConsoleLogs,
};

export type PlaywrightUtilsWeb = typeof web;

export { formatArgument, interceptConsoleLogs } from './interceptConsoleLogs';
