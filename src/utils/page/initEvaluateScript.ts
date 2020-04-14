import { Page } from 'playwright-core';

const NAVIGATION_ERRORS = [
  'Execution context was destroyed',
  'Inspected target navigated or closed',
];

export const initEvaluateScript = async (
  page: Page,
  script: string | Function,
  ...args: any[]
): Promise<any> => {
  if (page.isClosed()) return;

  await page.addInitScript(script, ...args);

  try {
    const result = await page.evaluate(script as any, ...args);
    return result;
  } catch (error) {
    // ignore errors caused by navigation
    // since addInitScript will call the script again
    const shouldIgnore = !!NAVIGATION_ERRORS.find((message) =>
      error.message.includes(message),
    );
    if (shouldIgnore) return;

    throw error;
  }
};
