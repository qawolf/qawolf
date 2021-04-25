import { NextApiRequest } from "next";

import { createGitHubCommitStatus } from "../../models/github_commit_status";
import { findPullRequestCommentForTrigger } from "../../models/pull_request_comment";
import { findRunsForSuite } from "../../models/run";
import { createCommitStatus } from "../../services/gitHub/commitStatus";
import {
  createComment,
  updateComment,
} from "../../services/gitHub/pullRequest";
import { Integration, ModelOptions, Trigger } from "../../types";

type CreateCommitStatusForIntegration = {
  integration: Integration | null;
  suite_id: string;
  trigger: Trigger;
};

type CreateCommentForIntegration = {
  integration: Integration | null;
  suite_id: string;
  trigger: Trigger;
};

export const createCommitStatusForIntegration = async (
  req: NextApiRequest,
  { integration, suite_id, trigger }: CreateCommitStatusForIntegration,
  options: ModelOptions
): Promise<void> => {
  const log = options.logger.prefix("createCommitStatusForIntegration");
  const { deployment_url, sha } = req.body;

  if (!integration) {
    log.debug("skip: no integration");
    return;
  }

  const [owner, repo] = integration.github_repo_name.split("/");

  const commitStatus = await createCommitStatus(
    {
      context: `QA Wolf - ${trigger.name}`,
      installationId: integration.github_installation_id,
      owner,
      repo,
      sha,
      suiteId: suite_id,
    },
    options
  );

  await createGitHubCommitStatus(
    {
      context: commitStatus.context,
      deployment_url,
      github_installation_id: integration.github_installation_id,
      owner,
      repo,
      sha,
      suite_id,
      trigger_id: trigger.id,
    },
    options
  );
};

export const createCommentForIntegration = async (
  req: NextApiRequest,
  { integration, suite_id, trigger }: CreateCommentForIntegration,
  options: ModelOptions
): Promise<void> => {
  const log = options.logger.prefix("createCommentForIntegration");
  const { committed_at, pull_request_id } = req.body;

  if (!committed_at || !integration || !pull_request_id) {
    const payload = { committed_at, integration, pull_request_id };
    log.debug(`skip: missing field, ${JSON.stringify(payload)}`);
    return;
  }

  const comment = await findPullRequestCommentForTrigger(
    {
      deployment_integration_id: integration.id,
      pull_request_id,
      trigger_id: trigger.id,
    },
    options
  );

  const isStale =
    comment && new Date(committed_at) <= new Date(comment.last_commit_at);

  if (isStale) {
    log.debug(
      `skip: committed at ${committed_at} < last commit at ${comment.last_commit_at}`
    );
    return;
  }

  const runs = await findRunsForSuite(suite_id, options);
  // comment already exists, update it
  if (comment) {
    return updateComment(
      { comment, committed_at, integration, runs, suite_id, trigger },
      options
    );
  }
  // comment does not exist, create it
  return createComment(
    { committed_at, integration, pull_request_id, runs, suite_id, trigger },
    options
  );
};
