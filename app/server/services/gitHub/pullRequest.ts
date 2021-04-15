import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";

import { ModelOptions } from "../../types";
import { createInstallationAccessToken } from "./app";

export type PullRequestComment = RestEndpointMethodTypes["issues"]["createComment"]["response"]["data"];

type CreatePullRequestComment = {
  body: string;
  installationId: number;
  issue_number: number;
  owner: string;
  repo: string;
};

export const createPullRequestComment = async (
  { installationId, ...fields }: CreatePullRequestComment,
  options: ModelOptions
): Promise<PullRequestComment> => {
  const token = await createInstallationAccessToken(installationId, options);
  const octokit = new Octokit({ auth: token });

  const { data } = await octokit.issues.createComment({ ...fields });

  return data;
};
