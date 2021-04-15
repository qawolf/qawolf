import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";

import { ModelOptions } from "../../types";
import { createInstallationAccessToken } from "./app";

export type PullRequestComment = RestEndpointMethodTypes["issues"]["createComment"]["response"]["data"];

type CreatePullRequestComment = {
  body: string;
  installationId: number;
  issueNumber: number;
  owner: string;
  repo: string;
};

type UpdatePullRequestComment = {
  body: string;
  commentId: number;
  installationId: number;
  owner: string;
  repo: string;
};

export const createPullRequestComment = async (
  { installationId, issueNumber, ...fields }: CreatePullRequestComment,
  options: ModelOptions
): Promise<PullRequestComment> => {
  const token = await createInstallationAccessToken(installationId, options);
  const octokit = new Octokit({ auth: token });

  const { data } = await octokit.issues.createComment({
    ...fields,
    issue_number: issueNumber,
  });

  return data;
};

export const updatePullRequestComment = async (
  { commentId, installationId, ...fields }: UpdatePullRequestComment,
  options: ModelOptions
): Promise<PullRequestComment> => {
  const token = await createInstallationAccessToken(installationId, options);
  const octokit = new Octokit({ auth: token });

  const { data } = await octokit.issues.updateComment({
    ...fields,
    comment_id: commentId,
  });

  return data;
};
