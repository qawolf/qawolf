export const isNil = (value?: any): boolean => {
  return typeof value === "undefined" || value === null;
};
