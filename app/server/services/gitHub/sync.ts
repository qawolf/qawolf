import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";
import { camelCase } from "lodash";

import { connectDb } from "../../db";
import { Logger } from "../../Logger";
import { findIntegration } from "../../models/integration";
import { findTeam } from "../../models/team";

type GitTree = RestEndpointMethodTypes["git"]["createTree"]["parameters"]["tree"];

import { findTestsForTeam } from "../../models/test";
import { Integration, ModelOptions, Team } from "../../types";
import { createSyncInstallationAccessToken } from "./app";

const mode = "100644" as const; // blob

type BaseGitHubFields = {
  octokit: Octokit;
  owner: string;
  repo: string;
};

type CreateCommit = BaseGitHubFields & {
  parents: string[];
  treeSha: string;
};

type CreateTree = BaseGitHubFields & {
  tree: GitTree;
  treeSha: string;
};

type CurrentCommit = {
  sha: string;
  treeSha: string;
};

type FindCurrentCommit = BaseGitHubFields & { branch: string };

type UpdateRef = BaseGitHubFields & {
  branch: string;
  sha: string;
};

const buildGitHubFields = async (
  integration: Integration,
  options: ModelOptions
): Promise<BaseGitHubFields> => {
  const token = await createSyncInstallationAccessToken(
    integration.github_installation_id,
    options
  );
  const octokit = new Octokit({ auth: token });
  const [owner, repo] = integration.github_repo_name.split("/");

  return { octokit, owner, repo };
};

export const buildQaWolfTree = async (
  team: Team,
  options: ModelOptions
): Promise<GitTree> => {
  const tests = await findTestsForTeam(team.id, options);

  const helperFiles = [
    {
      content: team.helpers,
      mode,
      path: `qawolf/helpers/index.js`,
    },
  ];

  const testFiles = tests
    .filter((test) => !test.guide)
    .map((test) => {
      return {
        content: test.code,
        mode,
        path: `qawolf/${camelCase(test.name)}.test.js`,
      };
    });

  return [...testFiles, ...helperFiles];
};

export const createCommit = async (
  { octokit, owner, repo, parents, treeSha }: CreateCommit,
  { logger }: ModelOptions
): Promise<string> => {
  const log = logger.prefix("createCommit");

  const { data } = await octokit.git.createCommit({
    message: "initial qawolf commit",
    owner,
    parents,
    repo,
    tree: treeSha,
  });
  const sha = data.sha;
  log.debug("commit sha", sha);

  return sha;
};

export const createTree = async (
  { octokit, owner, repo, tree, treeSha }: CreateTree,
  { logger }: ModelOptions
): Promise<string> => {
  const log = logger.prefix("createTree");

  const { data } = await octokit.git.createTree({
    base_tree: treeSha,
    owner,
    repo,
    tree,
  });
  const sha = data.sha;
  log.debug("tree sha", sha);

  return sha;
};

export const findCurrentCommit = async (
  { branch, octokit, owner, repo }: FindCurrentCommit,
  { logger }: ModelOptions
): Promise<CurrentCommit> => {
  const log = logger.prefix("findCurrentCommit");

  const { data: refData } = await octokit.git.getRef({
    owner,
    ref: `heads/${branch}`,
    repo,
  });
  const sha = refData.object.sha;
  log.debug("head sha", sha);

  const { data: commitData } = await octokit.git.getCommit({
    commit_sha: sha,
    owner,
    repo,
  });

  return { sha, treeSha: commitData.tree.sha };
};

export const findDefaultBranch = async (
  { octokit, owner, repo }: BaseGitHubFields,
  { logger }: ModelOptions
): Promise<string> => {
  const log = logger.prefix("findDefaultBranch");

  const { data } = await octokit.repos.get({ owner, repo });
  const defaultBranch = data.default_branch;

  log.debug("default branch", defaultBranch);

  return defaultBranch;
};

export const updateRef = async ({
  branch,
  octokit,
  owner,
  repo,
  sha,
}: UpdateRef): Promise<void> => {
  await octokit.git.updateRef({
    owner,
    ref: `heads/${branch}`,
    repo,
    sha,
  });
};

export const createInitialCommit = async (
  team_id: string,
  options: ModelOptions
): Promise<void> => {
  const log = options.logger.prefix("createInitialCommit");
  log.debug("team", team_id);

  const team = await findTeam(team_id, options);
  const integration = await findIntegration(
    team.git_sync_integration_id,
    options
  );

  const fields = await buildGitHubFields(integration, options);

  const branch = await findDefaultBranch(fields, options);
  const tree = await buildQaWolfTree(team, options);
  const currentCommit = await findCurrentCommit({ ...fields, branch }, options);

  const treeSha = await createTree(
    {
      ...fields,
      tree,
      treeSha: currentCommit.treeSha,
    },
    options
  );
  const commitSha = await createCommit(
    { ...fields, parents: [currentCommit.sha], treeSha },
    options
  );
  await updateRef({ ...fields, branch, sha: commitSha });

  log.debug("success");
};

// (async () => {
//   createInitialCommit("teamId", {
//     db: connectDb(),
//     logger: new Logger(),
//   });
// })();
