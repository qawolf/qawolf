import { logger } from "@qawolf/logger";
import { sleep } from "@qawolf/web";

const MESSAGES_TO_RETRY = [
  "Execution context was destroyed",
  "Inspected target navigated or closed",
  "Node is detached from document",
  "Node is either not visible or not an HTMLElement",
  "was canceled by another one"
];

export const retryExecutionError = async (
  func: () => Promise<any>,
  times: number = 3
): Promise<any> => {
  for (let i = 0; i < times; i++) {
    try {
      const result = await func();
      return result;
    } catch (error) {
      const shouldRetry = !!MESSAGES_TO_RETRY.find(messageToRetry =>
        error.message.includes(messageToRetry)
      );

      if (i < times - 1 && shouldRetry) {
        logger.verbose(
          `retryExecutionError: retrying ${i + 1}/${times} error: "${
            error.message
          }"`
        );
        await sleep(1000);
        continue;
      }

      logger.error(
        `retryExecutionError: will not retry error: "${error.message}"`
      );
      throw error;
    }
  }
};
