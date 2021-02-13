import ContainerInstanceManagementClient from "azure-arm-containerinstance";

import { findRunners } from "../models/runner";
import {
  deleteContainerGroup,
  getRunnerContainerGroups,
} from "../services/azure/container";
import { ModelOptions } from "../types";

/**
 * @summary Delete container groups that do not have a runner.
 */
export const deleteRunners = async (
  client: ContainerInstanceManagementClient,
  { db, logger }: ModelOptions
): Promise<void> => {
  const log = logger.prefix("deleteRunners");

  const groups = await getRunnerContainerGroups(client);

  log.debug(`check ${groups.length} groups`);

  const runners = await findRunners(
    { ids: groups.map(({ name }) => name.replace("runner-", "")) },
    { db, logger }
  );

  const promises = groups.map(async (group) => {
    const runner = runners.find((r) => group.name.includes(r.id));

    if (!runner || runner.deleted_at) {
      await deleteContainerGroup({
        client,
        logger,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        name: group.name!,
      });
    }
  });

  await Promise.all(promises);
};
