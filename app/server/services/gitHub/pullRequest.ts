import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";
import { findIntegration } from "../../models/integration";

import * as pullRequestCommentModel from "../../models/pull_request_comment";
import { findRun, findRunsForSuite } from "../../models/run";
import { findSuite } from "../../models/suite";
import { findTrigger } from "../../models/trigger";
import { findUser, findUsersForTeam } from "../../models/user";
import {
  Integration,
  ModelOptions,
  PullRequestComment,
  SuiteRun,
  Trigger,
  User,
} from "../../types";
import { randomChoice } from "../../utils";
import { createInstallationAccessToken } from "./app";
import { buildCommentForSuite } from "./markdown";

export type GitHubPullRequestComment = RestEndpointMethodTypes["issues"]["createComment"]["response"]["data"];

type CreateComment = {
  committed_at: string;
  integration: Integration;
  pull_request_id: number;
  runs: SuiteRun[];
  suite_id: string;
  trigger: Trigger;
};

type CreatePullRequestComment = {
  body: string;
  installationId: number;
  owner: string;
  pullRequestId: number;
  repo: string;
};

type UpdateComment = {
  comment: PullRequestComment;
  committed_at?: string;
  integration: Integration;
  runs: SuiteRun[];
  suite_id: string;
  trigger: Trigger;
};

type UpdatePullRequestComment = {
  body: string;
  commentId: number;
  installationId: number;
  owner: string;
  repo: string;
};

export const createPullRequestComment = async (
  { installationId, pullRequestId, ...fields }: CreatePullRequestComment,
  options: ModelOptions
): Promise<GitHubPullRequestComment> => {
  const token = await createInstallationAccessToken(installationId, options);
  const octokit = new Octokit({ auth: token });

  const { data } = await octokit.issues.createComment({
    ...fields,
    issue_number: pullRequestId,
  });

  return data;
};

export const updatePullRequestComment = async (
  { commentId, installationId, ...fields }: UpdatePullRequestComment,
  options: ModelOptions
): Promise<GitHubPullRequestComment> => {
  const token = await createInstallationAccessToken(installationId, options);
  const octokit = new Octokit({ auth: token });

  const { data } = await octokit.issues.updateComment({
    ...fields,
    comment_id: commentId,
  });

  return data;
};

export const createComment = async (
  {
    committed_at,
    integration,
    pull_request_id,
    runs,
    suite_id,
    trigger,
  }: CreateComment,
  options: ModelOptions
): Promise<void> => {
  const [owner, repo] = integration.github_repo_name.split("/");

  const users = await findUsersForTeam(trigger.team_id, options);
  const user = randomChoice(users) as User;

  const body = buildCommentForSuite({ runs, suite_id, trigger, user });

  const comment = await createPullRequestComment(
    {
      body,
      installationId: integration.github_installation_id,
      owner,
      pullRequestId: pull_request_id,
      repo,
    },
    options
  );

  await pullRequestCommentModel.createPullRequestComment(
    {
      body,
      comment_id: comment.id,
      deployment_integration_id: integration.id,
      last_commit_at: committed_at,
      pull_request_id,
      suite_id,
      trigger_id: trigger.id,
      user_id: user.id,
    },
    options
  );
};

export const updateComment = async (
  {
    comment,
    committed_at,
    integration,
    runs,
    suite_id,
    trigger,
  }: UpdateComment,
  options: ModelOptions
): Promise<void> => {
  const [owner, repo] = integration.github_repo_name.split("/");
  const user = await findUser({ id: comment.user_id }, options);

  const body = buildCommentForSuite({ runs, suite_id, trigger, user });

  await updatePullRequestComment(
    {
      body,
      commentId: comment.comment_id,
      installationId: integration.github_installation_id,
      owner,
      repo,
    },
    options
  );

  const updates = { body, last_commit_at: committed_at, suite_id };
  if (committed_at) updates.last_commit_at = committed_at;

  await pullRequestCommentModel.updatePullRequestComment(
    { ...updates, id: comment.id },
    options
  );
};

export const updateCommentForSuite = async (
  suite_id: string,
  options: ModelOptions
): Promise<void> => {
  const log = options.logger.prefix("updateCommentForSuite");
  log.debug("suite", suite_id);

  const comment = await pullRequestCommentModel.findPullRequestCommentForSuite(
    suite_id,
    options
  );

  if (!comment) {
    log.debug("no comment for suite", suite_id);
    return;
  }

  const integration = await findIntegration(
    comment.deployment_integration_id,
    options
  );
  const runs = await findRunsForSuite(suite_id, options);
  const trigger = await findTrigger(comment.trigger_id, options);

  await updateComment(
    { comment, integration, runs, suite_id, trigger },
    options
  );
};
