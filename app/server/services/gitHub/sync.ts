import { RestEndpointMethodTypes } from "@octokit/rest";
import { camelCase } from "lodash";

// import { connectDb } from "../../db";
// import { Logger } from "../../Logger";
// import { findTeam } from "../../models/team";
import { findTestsForTeam, updateTest } from "../../models/test";
import { ModelOptions, Team } from "../../types";
import { createOctokitForIntegration, OctokitRepo } from "./app";
import { findDefaultBranch } from "./branch";

export type Tree = RestEndpointMethodTypes["git"]["createTree"]["parameters"]["tree"];

type CreateCommit = {
  branch?: string;
  message: string;
  tree: Tree;
  team: Team;
};

type CreateCommitForTree = OctokitRepo & {
  message: string;
  parents: string[];
  treeSha: string;
};

type CreateTree = OctokitRepo & {
  tree: Tree;
  treeSha: string;
};

type CurrentCommit = {
  sha: string;
  treeSha: string;
};

type FindCurrentCommit = OctokitRepo & { branch: string };

type UpdateRef = OctokitRepo & {
  branch: string;
  sha: string;
};

export const BLOB_MODE = "100644" as const; // blob

export const buildQaWolfTree = async (
  team: Team,
  options: ModelOptions
): Promise<Tree> => {
  const tests = await findTestsForTeam(team.id, options);

  const helperFiles = [
    {
      content: team.helpers,
      mode: BLOB_MODE,
      path: `qawolf/helpers/index.js`,
    },
  ];

  const filteredTests = tests.filter((test) => !test.guide);

  const testFiles = filteredTests.map((test) => {
    return {
      content: test.code,
      mode: BLOB_MODE,
      path: `qawolf/${camelCase(test.name)}.test.js`,
    };
  });

  await Promise.all(
    filteredTests.map((test) => {
      return updateTest(
        { id: test.id, name: null, path: `${camelCase(test.name)}.test.js` },
        options
      );
    })
  );

  return [...testFiles, ...helperFiles];
};

export const createCommitForTree = async (
  { message, octokit, owner, repo, parents, treeSha }: CreateCommitForTree,
  { logger }: ModelOptions
): Promise<string> => {
  const log = logger.prefix("createCommitForTree");

  const { data } = await octokit.git.createCommit({
    message,
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

export const createCommit = async (
  { branch: passedBranch, message, tree, team }: CreateCommit,
  options: ModelOptions
): Promise<void> => {
  const log = options.logger.prefix("createCommit");
  log.debug("team", team.id);

  const fields = await createOctokitForIntegration(
    team.git_sync_integration_id,
    options
  );

  const branch = passedBranch || (await findDefaultBranch(fields, options));
  const currentCommit = await findCurrentCommit({ ...fields, branch }, options);

  const treeSha = await createTree(
    {
      ...fields,
      tree,
      treeSha: currentCommit.treeSha,
    },
    options
  );

  const commitSha = await createCommitForTree(
    {
      ...fields,
      message,
      parents: [currentCommit.sha],
      treeSha,
    },
    options
  );

  await updateRef({ ...fields, branch, sha: commitSha });

  log.debug("success");
};

// (async () => {
//   const options = { db: connectDb(), logger: new Logger() };

//   const team = await findTeam("teamId", options);
//   const tree = await buildQaWolfTree(team, options);

//   createCommit(
//     { message: "initial qawolf commit", team, tree },
//     options
//   );
// })();
