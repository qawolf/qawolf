export const sleep = (milliseconds: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

export const waitFor = async <T>(
  valueFunction: () => T | null,
  timeoutMs: number,
  sleepMs: number = 500
): Promise<T | null> => {
  const startTime = Date.now();

  do {
    const value = valueFunction();
    if (value) return value;

    await sleep(sleepMs);
  } while (Date.now() - startTime < timeoutMs);

  return null;
};

export const waitUntil = async (
  predicate: () => boolean | Promise<boolean>,
  timeoutMs: number,
  sleepMs: number = 500
): Promise<void> => {
  const startTime = Date.now();

  do {
    const conditionMet = await predicate();
    if (conditionMet) return;

    await sleep(sleepMs);
  } while (Date.now() - startTime < timeoutMs);

  throw new Error(
    `waitUntil: waited ${timeoutMs} milliseconds but condition never met`
  );
};
