import { getXpath } from "./xpath";

type LogCallback = (level: string, message: string) => void;

const LOG_LEVELS = ["debug", "error", "info", "log", "warn"];

const formatArgument = (argument: any) => {
  if (argument.nodeName) {
    // log nodes as their xpath
    return getXpath(argument as Node);
  }

  return argument.toString();
};

export const captureLogs = (logLevel: string, callback: LogCallback) => {
  LOG_LEVELS.forEach((level: keyof Console) => {
    const browserLog = console[level];

    console[level] = (...args: any) => {
      const message: string = args
        .map((arg: any) => formatArgument(arg))
        .join(" ");

      if (
        level === "debug" &&
        message.startsWith("qawolf: ") &&
        logLevel.toLowerCase() !== "debug"
      ) {
        // only log qawolf debug logs when logLevel = "debug"
        return;
      }

      browserLog(...args);
      callback(level, message);
    };
  });
};
