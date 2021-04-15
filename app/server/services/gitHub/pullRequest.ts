import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";

import * as pullRequestCommentModel from "../../models/pull_request_comment";
import { findUser, findUsersForTeam } from "../../models/user";
import {
  Integration,
  ModelOptions,
  PullRequestComment,
  Suite,
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
  suite: Suite;
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
  suite: Suite;
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
    suite,
    trigger,
  }: CreateComment,
  options: ModelOptions
): Promise<void> => {
  const [owner, repo] = integration.github_repo_name.split("/");

  const users = await findUsersForTeam(suite.team_id, options);
  const user = randomChoice(users) as User;

  const body = buildCommentForSuite({ runs, suite, trigger, user });

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
      suite_id: suite.id,
      trigger_id: trigger.id,
      user_id: user.id,
    },
    options
  );
};

export const updateComment = async (
  { comment, committed_at, integration, runs, suite, trigger }: UpdateComment,
  options: ModelOptions
): Promise<void> => {
  const [owner, repo] = integration.github_repo_name.split("/");
  const user = await findUser({ id: comment.user_id }, options);

  const body = buildCommentForSuite({ runs, suite, trigger, user });

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

  const updates = { body, last_commit_at: committed_at, suite_id: suite.id };
  if (committed_at) updates.last_commit_at = committed_at;

  await pullRequestCommentModel.updatePullRequestComment(
    { ...updates, id: comment.id },
    options
  );
};
