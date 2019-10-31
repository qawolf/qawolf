export const sleep = (milliseconds: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

export const waitFor = async <T>(
  valueFn: () => T | null,
  timeoutMs: number,
  sleepMs: number = 500
): Promise<T | null> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const value = valueFn();
    if (value) return value;

    await sleep(sleepMs);
  }

  return null;
};

export const waitUntil = async (
  booleanFn: () => boolean,
  timeoutMs: number,
  sleepMs: number = 500
): Promise<void> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const conditionMet = booleanFn();
    if (conditionMet) return;

    await sleep(sleepMs);
  }

  throw new Error(
    `waitUntil: waited ${timeoutMs} milliseconds but condition never met`
  );
};
