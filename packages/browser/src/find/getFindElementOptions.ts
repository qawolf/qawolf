import { CONFIG } from "@qawolf/config";
import { FindElementOptions } from "@qawolf/types";
import { isNil } from "@qawolf/web";

export const getFindElementOptions = <T extends FindElementOptions>(
  options: T
) => {
  const findOptions = { ...options };

  if (isNil(options.sleepMs)) {
    findOptions.sleepMs = CONFIG.sleepMs;
  }

  if (isNil(options.timeoutMs)) {
    findOptions.timeoutMs = CONFIG.timeoutMs;
  }

  return findOptions;
};
