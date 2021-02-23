import { minutesFromNow } from "../../shared/utils";
import environment from "../environment";
import { countIncompleteRuns } from "../models/run";
import {
  createRunners,
  deleteUnhealthyRunners,
  findRunners,
  updateRunner,
} from "../models/runner";
import { countIncompleteTests, LocationCount } from "../models/test";
import { ModelOptions } from "../types";

/**
 * @summary Calculate the number of runners per location
 *          to get available runners to equal the buffer.
 */
export const calculateRunnerPool = async (
  options: ModelOptions
): Promise<LocationCount[]> => {
  const log = options.logger.prefix("calculateRunnerPool");

  // Each location should have enough runners for the buffer and
  // the incomplete (pending / in progress) tests and runs
  const incompleteRuns = await countIncompleteRuns(options);
  const pendingTests = await countIncompleteTests("eastus2", options);

  const pool: LocationCount[] = [];

  Object.keys(environment.RUNNER_LOCATIONS).forEach((location) => {
    const entry = environment.RUNNER_LOCATIONS[location];

    const buffer = entry?.buffer || 0;

    const { count: numPendingTests } = pendingTests.find(
      (c) => c.location === location
    ) || { count: 0 };

    let count = buffer + numPendingTests;
    if (location === "eastus2") count += incompleteRuns;

    pool.push({ count, location });
  });

  log.debug(pool);

  return pool;
};

/**
 * @summary Create or delete runners to match the calculated runner pool.
 */
export const balanceRunnerPool = async ({
  db,
  logger,
}: ModelOptions): Promise<void> => {
  const pool = await calculateRunnerPool({ db, logger });

  await db.transaction(async (trx) => {
    const runners = await findRunners({}, { db: trx, logger });

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
        { db: trx, logger }
      )
    );

    await Promise.all([
      createRunners(locationsToCreate, { db: trx, logger }),
      ...deletePromises,
    ]);
  });
};

export const orchestrateRunners = async (
  options: ModelOptions
): Promise<void> => {
  await deleteUnhealthyRunners(options);
  await balanceRunnerPool(options);
};
