// https://stackoverflow.com/a/1214753
export const minutesFromNow = (minutes = 0): string => {
  return new Date(Date.now() + minutes * 60000).toISOString();
};
