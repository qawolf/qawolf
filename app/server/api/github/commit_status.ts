import { EventPayloads } from "@octokit/webhooks";

import { ModelOptions } from "../../types";
import { createSuitesForDeployment } from "./deployment";

export const isNetlifyDeploymentEvent = ({
  description,
  sender,
}: EventPayloads.WebhookPayloadStatus): boolean => {
  const isFromNetlify = sender.login === "netlify[bot]";
  const isDeployment = (description || "").toLowerCase().includes("deploy");

  return isFromNetlify && isDeployment;
};

export const handleCommitStatusEvent = async (
  payload: EventPayloads.WebhookPayloadStatus,
  options: ModelOptions
): Promise<void> => {
  const log = options.logger.prefix("handleCommitStatusEvent");
  const { installation, repository, sha, state, target_url } = payload;

  if (!isNetlifyDeploymentEvent(payload)) {
    log.debug("skip, not from netlify", payload.sender.login);
    return;
  }

  if (state !== "success") {
    log.debug("skip, commit status state", state);
    return;
  }

  return createSuitesForDeployment(
    {
      deploymentUrl: target_url,
      installationId: installation.id,
      repoId: repository.id,
      repoFullName: repository.full_name,
      sha,
    },
    options
  );
};
