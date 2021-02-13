import { createGitHubCommitStatus } from "../../models/github_commit_status";
import { createSuiteForTests } from "../../models/suite";
import { findEnabledTestsForTrigger } from "../../models/test";
import { findTriggersForGitHubIntegration } from "../../models/trigger";
import {
  createCommitStatus,
  findBranchesForCommit,
} from "../../services/gitHub/app";
import { ModelOptions, Trigger } from "../../types";

type CreateSuiteForDeployment = {
  branches: string[];
  deploymentUrl: string;
  environment?: string;
  installationId: number;
  owner: string;
  repo: string;
  sha: string;
  trigger: Trigger;
};

type CreateSuitesForDeployment = {
  deploymentUrl: string;
  environment?: string;
  installationId: number;
  repoFullName: string;
  repoId: number;
  sha: string;
};

type ShouldRunTriggerOnDeployment = {
  branches: string[];
  environment?: string;
  trigger: Trigger;
};

export const shouldRunTriggerOnDeployment = ({
  branches,
  environment,
  trigger,
}: ShouldRunTriggerOnDeployment): boolean => {
  const isBranchMatch = trigger.deployment_branches
    ? trigger.deployment_branches.split(",").some((b) => branches.includes(b))
    : true;

  const isEnvironmentMatch = trigger.deployment_environment
    ? trigger.deployment_environment === environment
    : true;

  return isBranchMatch && isEnvironmentMatch;
};

const createSuiteForDeployment = async (
  {
    branches,
    deploymentUrl,
    environment,
    installationId,
    owner,
    repo,
    sha,
    trigger,
  }: CreateSuiteForDeployment,
  options: ModelOptions
): Promise<void> => {
  const log = options.logger.prefix("createSuiteForDeployment");

  if (!shouldRunTriggerOnDeployment({ branches, environment, trigger })) {
    log.debug(
      `skip trigger ${trigger.id} on branches ${branches} and environment ${environment}`
    );
    return;
  }

  const tests = await findEnabledTestsForTrigger(
    { trigger_id: trigger.id },
    options
  );

  if (!tests.length) {
    log.debug("skip, no enabled tests for trigger", trigger.id);
    return;
  }

  const { suite } = await createSuiteForTests(
    {
      environment_variables: { URL: deploymentUrl },
      trigger_id: trigger.id,
      team_id: trigger.team_id,
      tests,
    },
    options
  );

  const commitStatus = await createCommitStatus(
    {
      context: `QA Wolf - ${trigger.name}`,
      installationId,
      owner,
      repo,
      sha,
      suiteId: suite.id,
    },
    options
  );

  await createGitHubCommitStatus(
    {
      context: commitStatus.context,
      deployment_url: deploymentUrl,
      github_installation_id: installationId,
      owner,
      repo,
      sha,
      suite_id: suite.id,
      trigger_id: trigger.id,
    },
    options
  );
};

export const createSuitesForDeployment = async (
  {
    deploymentUrl,
    environment,
    installationId,
    repoFullName,
    repoId,
    sha,
  }: CreateSuitesForDeployment,
  options: ModelOptions
): Promise<void> => {
  const [owner, repo] = repoFullName.split("/");

  const branches = await findBranchesForCommit(
    {
      installationId,
      owner,
      repo,
      sha,
    },
    options
  );

  return options.db.transaction(async (trx) => {
    const triggers = await findTriggersForGitHubIntegration(repoId, {
      db: trx,
      logger: options.logger,
    });

    await Promise.all(
      triggers.map((trigger) =>
        createSuiteForDeployment(
          {
            branches,
            deploymentUrl,
            environment,
            installationId,
            owner,
            repo,
            sha,
            trigger,
          },
          { db: trx, logger: options.logger }
        )
      )
    );
  });
};
