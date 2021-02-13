import { findPendingRun } from "../models/run";
import { findPendingTest } from "../models/test";
import { ModelOptions } from "../types";

export const checkPending = async ({
  db,
  logger,
}: ModelOptions): Promise<void> => {
  const log = logger.prefix("checkPending");

  const pendingTest = await findPendingTest(null, { db, logger });

  if (pendingTest) {
    const requestedAt = new Date(pendingTest.runner_requested_at);
    const testPendingMs = Date.now() - requestedAt.getTime();

    if (testPendingMs > 5000) {
      log.alert("test pending > 5s", pendingTest, testPendingMs);
    }
  }

  const pendingRun = await findPendingRun({}, { db, logger });
  if (pendingRun) {
    const createdAt = new Date(pendingRun.created_at);
    const runPendingMs = Date.now() - createdAt.getTime();

    if (runPendingMs > 15 * 60000) {
      log.alert("run pending > 15m", pendingRun, runPendingMs);
    }
  }
};
