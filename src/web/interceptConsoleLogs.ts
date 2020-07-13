import { getXpath } from './serialize';

const LOG_LEVELS = ['debug', 'error', 'info', 'log', 'warn'];

export const formatArgument = (argument: unknown): string => {
  if (typeof argument === 'string') {
    return argument;
  }

  if (argument && (argument as any).nodeName) {
    // log nodes as their xpath
    return getXpath(argument as Node);
  }

  try {
    return JSON.stringify(argument);
  } catch (error) {
    if (argument && argument.toString) {
      return argument.toString();
    }

    return '';
  }
};

export const interceptConsoleLogs = (): void => {
  if ((window as any).qawInterceptLogs) return;
  (window as any).qawInterceptLogs = true;

  LOG_LEVELS.forEach((level: keyof Console) => {
    const browserLog = console[level].bind(console);

    console[level] = (...args: any): void => {
      const message: string = args
        .map((arg: any) => formatArgument(arg))
        .join(' ');

      browserLog(...args);

      // playwright is currently using logs as its message transport. prevent infinite loop.
      if (message.includes('__playwright')) return;

      const logCallback = (window as any).qawLogEvent;
      if (logCallback) logCallback({ level, message });
    };
  });
};
