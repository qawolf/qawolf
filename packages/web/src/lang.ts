export const cleanText = (text: string = ""): string => {
  return text
    .trim()
    .replace(/[\r\n\t]+/g, " ") // remove extra newlines
    .replace(/\s\s+/g, " ") // remove excessive whitespace
    .toLowerCase();
};

export const isNil = (value?: any): boolean => {
  return typeof value === "undefined" || value === null;
};
