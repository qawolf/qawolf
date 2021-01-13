import ContainerInstanceManagementClient from "azure-arm-containerinstance";

import { Logger } from "../Logger";
import { findRunners, updateRunner } from "../models/runner";
import { restartRunnerContainerGroup } from "../services/azure/container";
import { minutesFromNow } from "../utils";

type RestartRunners = {
  client: ContainerInstanceManagementClient;
  logger: Logger;
};

/**
 * @summary Restart expired runner's container groups.
 */
export const restartRunners = async ({
  client,
  logger,
}: RestartRunners): Promise<void> => {
  const runners = await findRunners({ is_expired: true }, { logger });

  const restartPromises = runners.map((runner) => {
    const now = minutesFromNow();

    const updateRunnerPromise = updateRunner(
      {
        api_key: null,
        // reset the delete timer
        health_checked_at: now,
        id: runner.id,
        ready_at: null,
        restarted_at: now,
        run_id: null,
        session_expires_at: null,
        test_id: null,
      },
      { logger }
    );

    const restartPromise = restartRunnerContainerGroup({
      client,
      id: runner.id,
      logger,
    });

    return Promise.all([updateRunnerPromise, restartPromise]);
  });

  await Promise.all(restartPromises);
};
