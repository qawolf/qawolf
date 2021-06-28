export const formatArgument = (value: string | null): string => {
  if (value === null) return '""';

  // serialize newlines etc
  let escaped = JSON.stringify(value);
  // remove wrapper quotes
  escaped = escaped.substring(1, escaped.length - 1);
  // allow unescaped quotes
  escaped = escaped.replace(/\\"/g, '"');

  if (!escaped.includes(`"`)) return `"${escaped}"`;
  if (!escaped.includes(`'`)) return `'${escaped}'`;

  return "`" + escaped.replace(/`/g, "\\`") + "`";
};
