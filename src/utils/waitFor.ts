type WaitForOptions = {
  interval?: number;
  timeout?: number;
};

export const waitFor = async <T>(
  predicate: () => Promise<T> | T,
  options: WaitForOptions = {},
): Promise<T> => {
  const value = await predicate();
  if (value) return value;

  const timeout = isNaN(options.timeout) ? 30000 : options.timeout;
  const interval = isNaN(options.interval) ? 100 : options.interval;

  return new Promise((resolve, reject) => {
    // eslint-disable-next-line prefer-const
    let intervalId: NodeJS.Timeout, timeoutId: NodeJS.Timeout;

    let isDone = false;

    const done = (value?: T): void => {
      if (isDone) return;
      isDone = true;

      clearInterval(intervalId);
      clearTimeout(timeoutId);

      if (value) resolve(value);
      else reject(`waitFor timed out after ${timeout}ms`);
    };

    intervalId = setInterval(async () => {
      const value = await predicate();
      if (value) done(value);
    }, interval);

    timeoutId = setTimeout(() => done(), timeout);
  });
};
