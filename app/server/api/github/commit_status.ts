import { EventPayloads } from "@octokit/webhooks";

import { Logger } from "../../Logger";
import { createSuitesForDeployment } from "./deployment";

type HandleCommitStatusEvent = {
  logger: Logger;
  payload: EventPayloads.WebhookPayloadStatus;
};

export const isNetlifyDeploymentEvent = ({
  description,
  sender,
}: EventPayloads.WebhookPayloadStatus): boolean => {
  const isFromNetlify = sender.login === "netlify[bot]";
  const isDeployment = (description || "").toLowerCase().includes("deploy");

  return isFromNetlify && isDeployment;
};

export const handleCommitStatusEvent = async ({
  logger,
  payload,
}: HandleCommitStatusEvent): Promise<void> => {
  const log = logger.prefix("handleCommitStatusEvent");
  const { installation, repository, sha, state, target_url } = payload;

  if (!isNetlifyDeploymentEvent(payload)) {
    log.debug("skip, not from netlify", payload.sender.login);
    return;
  }

  if (state !== "success") {
    log.debug("skip, commit status state", state);
    return;
  }

  return createSuitesForDeployment({
    deploymentUrl: target_url,
    installationId: installation.id,
    logger,
    repoId: repository.id,
    repoFullName: repository.full_name,
    sha,
  });
};
