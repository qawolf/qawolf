import ContainerInstanceManagementClient from "azure-arm-containerinstance";

import { Logger } from "../Logger";
import { findRunners } from "../models/runner";
import {
  deleteContainerGroup,
  getRunnerContainerGroups,
} from "../services/azure/container";

type DeleteRunners = {
  client: ContainerInstanceManagementClient;
  logger: Logger;
};

/**
 * @summary Delete container groups that do not have a runner.
 */
export const deleteRunners = async ({
  client,
  logger,
}: DeleteRunners): Promise<void> => {
  const log = logger.prefix("deleteRunners");

  const groups = await getRunnerContainerGroups(client);

  log.debug(`check ${groups.length} groups`);

  const runners = await findRunners(
    { ids: groups.map(({ name }) => name.replace("runner-", "")) },
    { logger }
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
