import { logger } from "../../../test/server/utils";
import { createGitHubCommitStatus } from "../../models/github_commit_status";
import { findIntegration } from "../../models/integration";
import { createSuiteForTests } from "../../models/suite";
import { ensureTeamCanCreateSuite, findTeam } from "../../models/team";
import { findEnabledTestsForTrigger } from "../../models/test";
import { findTriggersForGitHubIntegration } from "../../models/trigger";
import {
  createCommitStatus,
  findBranchForCommit,
} from "../../services/gitHub/commitStatus";
import { ModelOptions, Trigger } from "../../types";
import { createCommentForIntegration } from "../netlify/github";

type BuildUrl = {
  deploymentUrl: string;
  pullRequestId: number | null;
  trigger: Trigger;
};

type CreateSuiteForDeployment = {
  committedAt: string;
  branch: string;
  deploymentUrl: string;
  environment?: string;
  installationId: number;
  owner: string;
  pullRequestId: number | null;
  repo: string;
  sha: string;
  trigger: Trigger;
};

type CreateSuitesForDeployment = {
  committedAt: string;
  deploymentUrl: string;
  environment?: string;
  installationId: number;
  ref: string;
  repoFullName: string;
  repoId: number;
  sha: string;
};

type ShouldRunTriggerOnDeployment = {
  branch: string;
  environment?: string;
  pullRequestId: number | null;
  trigger: Trigger;
};

export const buildUrl = ({
  deploymentUrl,
  pullRequestId,
  trigger,
}: BuildUrl): string => {
  if (!pullRequestId || !trigger.deployment_preview_url) return deploymentUrl;

  return trigger.deployment_preview_url.replace(
    /\d+.onrender.com\/?/,
    `${pullRequestId}.onrender.com`
  );
};

export const shouldRunTriggerOnDeployment = ({
  branch,
  environment,
  pullRequestId,
  trigger,
}: ShouldRunTriggerOnDeployment): boolean => {
  if (trigger.deployment_provider === "render" && !pullRequestId) {
    return false;
  }

  // for render deployments with multiple services,
  // wait for the one we want
  if (
    trigger.deployment_provider === "render" &&
    trigger.render_environment &&
    !environment.includes(trigger.render_environment)
  ) {
    return false;
  }

  const isBranchMatch = trigger.deployment_branches
    ? trigger.deployment_branches.split(",").includes(branch)
    : true;

  const isEnvironmentMatch = trigger.deployment_environment
    ? trigger.deployment_environment === environment
    : true;

  return isBranchMatch && isEnvironmentMatch;
};

const createSuiteForDeployment = async (
  {
    branch,
    committedAt,
    deploymentUrl,
    environment,
    installationId,
    owner,
    pullRequestId,
    repo,
    sha,
    trigger,
  }: CreateSuiteForDeployment,
  options: ModelOptions
): Promise<void> => {
  const log = options.logger.prefix("createSuiteForDeployment");

  if (
    !shouldRunTriggerOnDeployment({
      branch,
      environment,
      pullRequestId,
      trigger,
    })
  ) {
    log.debug(
      `skip trigger ${trigger.id} on branch ${branch}, environment ${environment}, pull request ${pullRequestId}`
    );
    return;
  }

  const tests = await findEnabledTestsForTrigger(trigger, options);

  if (!tests.length) {
    log.debug("skip, no enabled tests for trigger", trigger.id);
    return;
  }

  const team = await findTeam(trigger.team_id, options);
  ensureTeamCanCreateSuite(team, options.logger);

  const { suite } = await createSuiteForTests(
    {
      branch,
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

  // create comment on pull request
  await createCommentForIntegration(
    {
      committed_at: committedAt,
      integration: await findIntegration(
        trigger.deployment_integration_id,
        options
      ),
      pull_request_id: pullRequestId,
      suite_id: suite.id,
      trigger,
    },
    options
  );
};

export const createSuitesForDeployment = async (
  {
    committedAt,
    deploymentUrl,
    environment,
    installationId,
    ref,
    repoFullName,
    repoId,
    sha,
  }: CreateSuitesForDeployment,
  options: ModelOptions
): Promise<void> => {
  const [owner, repo] = repoFullName.split("/");

  const { branch, message, pullRequestId } = await findBranchForCommit(
    {
      installationId,
      owner,
      ref,
      repo,
      sha,
    },
    options
  );

  return options.db.transaction(async (trx) => {
    try {
      const triggers = await findTriggersForGitHubIntegration(repoId, {
        db: trx,
        logger: options.logger,
      });

      await Promise.all(
        triggers.map((trigger) =>
          createSuiteForDeployment(
            {
              branch,
              committedAt,
              deploymentUrl: buildUrl({
                deploymentUrl,
                pullRequestId,
                trigger,
              }),
              environment,
              installationId,
              owner,
              pullRequestId,
              repo,
              sha,
              trigger,
            },
            { db: trx, logger: options.logger }
          )
        )
      );
    } catch (error) {
      logger.alert("github error", error.message);
    }
  });
};
