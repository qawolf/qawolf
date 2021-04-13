export const buildTestCode = (
  url: string,
  domcontentloaded = false
): string => {
  let code =
    "const { context } = await launch();\nconst page = await context.newPage();\n";

  code += domcontentloaded
    ? `await page.goto('${url}', { waitUntil: "domcontentloaded" })\n`
    : `await page.goto('${url}');\n`;

  code += "// 🐺 QA Wolf will create code here";

  return code;
};

export const daysFromNow = (days = 0, existingDate?: number): string => {
  const date = existingDate ? new Date(existingDate) : new Date();
  date.setDate(date.getDate() + days);

  return date.toISOString();
};

// https://stackoverflow.com/a/1214753
export const minutesFromNow = (minutes = 0): string => {
  return new Date(Date.now() + minutes * 60000).toISOString();
};
