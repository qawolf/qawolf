import { db } from "../db";
import environment from "../environment";
import { Logger } from "../Logger";
import { countPendingRuns } from "../models/run";
import {
  createRunners,
  deleteUnhealthyRunners,
  findRunners,
  updateRunner,
} from "../models/runner";
import { countPendingTests, LocationCount } from "../models/test";
import { minutesFromNow } from "../utils";

/**
 * @summary Calculate the number of runners per location.
 *  The buffer + pending runs and tests.
 */
export const calculateRunnerPool = async (
  logger: Logger
): Promise<LocationCount[]> => {
  const log = logger.prefix("calculateRunnerPool");

  const pendingRuns = await countPendingRuns({ logger });
  const pendingTests = await countPendingTests("eastus2", { logger });

  const pool: LocationCount[] = [];

  Object.keys(environment.RUNNER_LOCATIONS).forEach((location) => {
    const entry = environment.RUNNER_LOCATIONS[location];

    const buffer = entry?.buffer || 0;

    const { count: numPendingTests } = pendingTests.find(
      (c) => c.location === location
    ) || { count: 0 };

    let count = buffer + numPendingTests;
    if (location === "eastus2") count += pendingRuns;

    pool.push({ count, location });
  });

  log.debug(pool);

  return pool;
};

/**
 * @summary Create or delete runners to match the calculated runner pool.
 */
export const balanceRunnerPool = async (logger: Logger): Promise<void> => {
  const pool = await calculateRunnerPool(logger);

  // this must be in a transaction because we do not
  // want to delete runners that become assigned
  await db.transaction(async (trx) => {
    const runners = await findRunners({}, { logger, trx });

    const deletableRunners = runners
      // only include unassigned runners
      .filter((r) => !r.run_id && !r.test_id)
      .sort((a, b) => {
        // prefer runners that are not ready
        if (!a.ready_at) return -1;
        if (!b.ready_at) return 1;
        return 0;
      });

    const locationsToCreate = [];
    const idsToDelete = [];

    pool.forEach(({ count: poolCount, location }) => {
      const locationRunners = runners.filter((r) => r.location === location);

      const difference = poolCount - locationRunners.length;

      if (difference > 0) {
        locationsToCreate.push(...Array(difference).fill(location));
      } else if (difference < 0) {
        const locationIdsToDelete = deletableRunners
          .filter((r) => r.location === location)
          .slice(0, Math.abs(difference))
          .map((r) => r.id);

        idsToDelete.push(...locationIdsToDelete);
      }
    });

    const deletePromises: Promise<unknown>[] = idsToDelete.map((id) =>
      updateRunner(
        {
          // don't throw an error if the runner is not found since
          // it could have already been deleted (for example it it was unhealthy)
          allow_skip: true,
          id,
          deleted_at: minutesFromNow(),
        },
        { logger, trx }
      )
    );

    await Promise.all([
      createRunners(locationsToCreate, { logger, trx }),
      ...deletePromises,
    ]);
  });
};

export const orchestrateRunners = async (logger: Logger): Promise<void> => {
  await deleteUnhealthyRunners({ logger });
  await balanceRunnerPool(logger);
};
