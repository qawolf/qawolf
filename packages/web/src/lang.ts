export const cleanText = (
  text: string = "",
  toLower: boolean = true
): string => {
  const cleaned = text
    .trim()
    .replace(/[\r\n\t]+/g, " ") // remove extra newlines
    .replace(/\s\s+/g, " "); // remove excessive whitespace

  if (toLower) return cleaned.toLowerCase();

  return cleaned;
};

export const isNil = (value?: any): boolean => {
  return typeof value === "undefined" || value === null;
};
