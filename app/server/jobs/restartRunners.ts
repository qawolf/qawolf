import ContainerInstanceManagementClient from "azure-arm-containerinstance";

import { findRunners, resetRunner } from "../models/runner";
import { restartRunnerContainerGroup } from "../services/azure/container";
import { ModelOptions } from "../types";

/**
 * @summary Restart expired runner's container groups.
 */
export const restartRunners = async (
  client: ContainerInstanceManagementClient,
  options: ModelOptions
): Promise<void> => {
  const logger = options.logger;
  const runners = await findRunners({ is_expired: true }, options);

  const promises = runners.map((runner) => {
    const id = runner.id;

    return Promise.all([
      resetRunner({ id, type: "restart" }, options),
      restartRunnerContainerGroup({ client, id, logger }),
    ]);
  });

  await Promise.all(promises);
};
