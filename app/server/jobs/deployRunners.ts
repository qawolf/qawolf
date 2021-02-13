import ContainerInstanceManagementClient from "azure-arm-containerinstance";

import { minutesFromNow } from "../../shared/utils";
import { findRunners, updateRunner } from "../models/runner";
import { createRunnerContainerGroup } from "../services/azure/container";
import { ModelOptions } from "../types";

/**
 * @summary Deploy runners' container groups.
 */
export const deployRunners = async (
  client: ContainerInstanceManagementClient,
  { db, logger }: ModelOptions
): Promise<void> => {
  const log = logger.prefix("deployRunners");

  const deployed_at = minutesFromNow();

  const runners = await db.transaction(async (trx) => {
    const runners = await findRunners(
      { deployed_at: null },
      { db: trx, logger }
    );

    const updatePromises = runners.map((r) =>
      updateRunner({ deployed_at, id: r.id }, { db: trx, logger })
    );

    return Promise.all(updatePromises);
  });

  log.debug(`deploy ${runners.map((r) => r.id)}`);

  const containerPromises = runners.map((runner) =>
    createRunnerContainerGroup({
      client,
      logger,
      runner,
    })
  );

  await Promise.all(containerPromises);

  log.debug("deployed", containerPromises.length);
};
