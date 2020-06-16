import { Page } from 'playwright';

const NAVIGATION_ERRORS = [
  'Execution context was destroyed',
  'Inspected target navigated or closed',
];

type PageFunction<R> = string | ((arg: any) => R | Promise<R>);

export const initEvaluateScript = async <R, Arg>(
  page: Page,
  script: string | PageFunction<R>,
  arg?: Arg,
): Promise<any> => {
  if (page.isClosed()) return;

  await page.addInitScript(script, arg);

  try {
    const result = await page.evaluate(script, arg);
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
