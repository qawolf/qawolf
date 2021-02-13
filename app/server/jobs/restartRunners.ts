import ContainerInstanceManagementClient from "azure-arm-containerinstance";

import { minutesFromNow } from "../../shared/utils";
import { findRunners, updateRunner } from "../models/runner";
import { restartRunnerContainerGroup } from "../services/azure/container";
import { ModelOptions } from "../types";

/**
 * @summary Restart expired runner's container groups.
 */
export const restartRunners = async (
  client: ContainerInstanceManagementClient,
  options: ModelOptions
): Promise<void> => {
  const runners = await findRunners({ is_expired: true }, options);

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
      options
    );

    const restartPromise = restartRunnerContainerGroup({
      client,
      id: runner.id,
      logger: options.logger,
    });

    return Promise.all([updateRunnerPromise, restartPromise]);
  });

  await Promise.all(restartPromises);
};
