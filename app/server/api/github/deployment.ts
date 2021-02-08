import { Transaction } from "knex";

import { db } from "../../db";
import { Logger } from "../../Logger";
import { createGitHubCommitStatus } from "../../models/github_commit_status";
import { createSuiteForTests } from "../../models/suite";
import { findEnabledTestsForGroup } from "../../models/test";
import { findGroupsForGitHubIntegration } from "../../models/trigger";
import {
  createCommitStatus,
  findBranchesForCommit,
} from "../../services/gitHub/app";
import { Group } from "../../types";

type CreateSuiteForDeployment = {
  branches: string[];
  deploymentUrl: string;
  environment?: string;
  group: Group;
  installationId: number;
  logger: Logger;
  owner: string;
  repo: string;
  sha: string;
  trx: Transaction;
};

type CreateSuitesForDeployment = {
  deploymentUrl: string;
  environment?: string;
  installationId: number;
  logger: Logger;
  repoFullName: string;
  repoId: number;
  sha: string;
};

type ShouldRunGroupOnDeployment = {
  branches: string[];
  environment?: string;
  group: Group;
};

export const shouldRunGroupOnDeployment = ({
  branches,
  environment,
  group,
}: ShouldRunGroupOnDeployment): boolean => {
  const isBranchMatch = group.deployment_branches
    ? group.deployment_branches.split(",").some((b) => branches.includes(b))
    : true;

  const isEnvironmentMatch = group.deployment_environment
    ? group.deployment_environment === environment
    : true;

  return isBranchMatch && isEnvironmentMatch;
};

const createSuiteForDeployment = async ({
  branches,
  deploymentUrl,
  environment,
  group,
  installationId,
  logger,
  owner,
  repo,
  sha,
  trx,
}: CreateSuiteForDeployment): Promise<void> => {
  const log = logger.prefix("createSuiteForDeployment");

  if (!shouldRunGroupOnDeployment({ branches, environment, group })) {
    log.debug(
      `skip group ${group.id} on branches ${branches} and environment ${environment}`
    );
    return;
  }

  const tests = await findEnabledTestsForGroup(
    { group_id: group.id },
    { logger, trx }
  );

  if (!tests.length) {
    log.debug("skip, no enabled tests for group", group.id);
    return;
  }

  const { suite } = await createSuiteForTests(
    {
      environment_variables: { URL: deploymentUrl },
      group_id: group.id,
      team_id: group.team_id,
      tests,
    },
    { logger, trx }
  );

  const commitStatus = await createCommitStatus({
    context: `QA Wolf - ${group.name}`,
    installationId,
    owner,
    repo,
    sha,
    suiteId: suite.id,
  });

  await createGitHubCommitStatus(
    {
      context: commitStatus.context,
      deployment_url: deploymentUrl,
      github_installation_id: installationId,
      group_id: group.id,
      owner,
      repo,
      sha,
      suite_id: suite.id,
    },
    { logger, trx }
  );
};

export const createSuitesForDeployment = async ({
  deploymentUrl,
  environment,
  installationId,
  logger,
  repoFullName,
  repoId,
  sha,
}: CreateSuitesForDeployment): Promise<void> => {
  const [owner, repo] = repoFullName.split("/");

  const branches = await findBranchesForCommit({
    installationId,
    owner,
    repo,
    sha,
  });

  return db.transaction(async (trx) => {
    const groups = await findGroupsForGitHubIntegration(repoId, {
      logger,
      trx,
    });

    await Promise.all(
      groups.map((group) => {
        return createSuiteForDeployment({
          branches,
          deploymentUrl,
          environment,
          group,
          installationId,
          logger,
          owner,
          repo,
          sha,
          trx,
        });
      })
    );
  });
};
