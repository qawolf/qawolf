import ContainerInstanceManagementClient from "azure-arm-containerinstance";

import { minutesFromNow } from "../../shared/utils";
import { db } from "../db";
import { Logger } from "../Logger";
import { findRunners, updateRunner } from "../models/runner";
import { createRunnerContainerGroup } from "../services/azure/container";

type DeployRunner = {
  client: ContainerInstanceManagementClient;
  logger: Logger;
};

/**
 * @summary Deploy runners' container groups.
 */
export const deployRunners = async ({
  client,
  logger,
}: DeployRunner): Promise<void> => {
  const log = logger.prefix("deployRunners");

  const deployed_at = minutesFromNow();

  const runners = await db.transaction(async (trx) => {
    const runners = await findRunners({ deployed_at: null }, { logger, trx });

    const updatePromises = runners.map((r) =>
      updateRunner({ deployed_at, id: r.id }, { logger, trx })
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
