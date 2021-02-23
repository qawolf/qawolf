import { createGitHubCommitStatus } from "../../models/github_commit_status";
import { createSuiteForTests } from "../../models/suite";
import { findTeam } from "../../models/team";
import { findEnabledTestsForTrigger } from "../../models/test";
import { findTriggersForGitHubIntegration } from "../../models/trigger";
import {
  createCommitStatus,
  findBranchesForCommit,
} from "../../services/gitHub/app";
import { ModelOptions, Trigger } from "../../types";

type BuildDeploymentUrlForTeam = {
  branches: string[];
  deploymentUrl: string;
  team_id: string;
};

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

export const buildDeploymentUrlForTeam = async (
  { branches, deploymentUrl, team_id }: BuildDeploymentUrlForTeam,
  options: ModelOptions
): Promise<string> => {
  const log = options.logger.prefix("buildDeploymentUrlForTeam");
  log.debug("branches", branches, "url", deploymentUrl);

  if (branches.length > 1) {
    log.alert(`multiple branches ${branches} for team ${team_id}`);
    return deploymentUrl;
  }

  const team = await findTeam(team_id, options);

  if (!team.vercel_team) {
    log.debug(`use deployment url ${deploymentUrl} for team ${team_id}`);
    return deploymentUrl;
  }

  // replace the slug in Vercel URL
  // https://vercel.com/changelog/urls-are-becoming-consistent
  const [prefix, domain] = deploymentUrl.split(team.vercel_team);

  const prefixPieces = prefix.split("-");
  const prefixWithoutSlug = prefixPieces.slice(0, prefixPieces.length - 2);

  const newUrl = `${prefixWithoutSlug.join("-")}-git-${branches[0]}-${
    team.vercel_team
  }${domain}`;

  log.debug(`new url ${newUrl}`);

  return newUrl;
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

  const finalDeploymentUrl = await buildDeploymentUrlForTeam(
    { branches, deploymentUrl, team_id: trigger.team_id },
    options
  );

  const { suite } = await createSuiteForTests(
    {
      environment_variables: { URL: finalDeploymentUrl },
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
      deployment_url: finalDeploymentUrl,
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
