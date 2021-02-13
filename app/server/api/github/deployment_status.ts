import { EventPayloads } from "@octokit/webhooks";

import { ModelOptions } from "../../types";
import { createSuitesForDeployment } from "./deployment";

export const handleDeploymentStatusEvent = async (
  payload: EventPayloads.WebhookPayloadDeploymentStatus,
  options: ModelOptions
): Promise<void> => {
  const log = options.logger.prefix("handleDeploymentStatusEvent");
  const {
    deployment,
    deployment_status: { environment, state, target_url },
    installation,
    repository,
  } = payload;

  if (state !== "success") {
    log.debug("skip, deployment state", state);
    return;
  }

  // Heroku passes the url in payload, while Vercel uses target url
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deploymentUrl = (deployment.payload as any)?.web_url || target_url;

  return createSuitesForDeployment(
    {
      deploymentUrl,
      environment: environment.toLowerCase(),
      installationId: installation.id,
      repoId: repository.id,
      repoFullName: repository.full_name,
      sha: deployment.sha,
    },
    options
  );
};
