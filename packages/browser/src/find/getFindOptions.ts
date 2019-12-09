import { CONFIG } from "@qawolf/config";
import { FindOptions } from "@qawolf/types";
import { isNil } from "@qawolf/web";

export const getFindOptions = <T extends FindOptions>(options: T) => {
  const findOptions = { ...options };

  if (isNil(options.sleepMs)) {
    findOptions.sleepMs = CONFIG.sleepMs;
  }

  if (isNil(options.timeoutMs)) {
    findOptions.timeoutMs = CONFIG.findTimeoutMs;
  }

  return findOptions;
};
