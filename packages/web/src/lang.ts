export const cleanText = (
  text: string = "",
  toLower: boolean = true
): string => {
  const cleaned = text
    // remove newlines
    .replace(/[\r\n\t]+/gm, " ")
    // remove excessive whitespace
    .replace(/\s+/gm, " ")
    .trim();

  if (toLower) return cleaned.toLowerCase();

  return cleaned;
};

export const decodeHtml = (text: string = "") => {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
};

export const isNil = (value?: any): boolean => {
  return typeof value === "undefined" || value === null;
};
