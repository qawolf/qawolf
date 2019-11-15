import { logger } from "@qawolf/logger";

export const retryExecutionError = async (
  func: () => Promise<any>,
  times: number = 3
): Promise<any> => {
  for (let i = 0; i < times; i++) {
    try {
      return await func();
    } catch (error) {
      if (
        (i < times - 1 &&
          error.message ===
            "Execution context was destroyed, most likely because of a navigation.") ||
        error.message ===
          "Protocol error (Runtime.callFunctionOn): Execution context was destroyed." ||
        error.message ===
          "Protocol error (Runtime.callFunctionOn): Inspected target navigated or closed" ||
        error.message === "Node is detached from document"
      ) {
        logger.verbose(
          `retryExecutionError: retrying ${i + 1}/${times} error: "${
            error.message
          }"`
        );
        continue;
      }

      logger.error(
        `retryExecutionError: will not retry unknown error: "${error.message}"`
      );
      throw error;
    }
  }
};
