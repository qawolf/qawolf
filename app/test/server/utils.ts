import { Transaction } from "knex";

import { Logger } from "../../server/Logger";
import { encrypt } from "../../server/models/encrypt";
import {
  ApiKey,
  DeploymentEnvironment,
  EnvironmentVariable,
  GitHubCommitStatus,
  Group,
  GroupTest,
  Integration,
  IntegrationType,
  Invite,
  Run,
  Runner,
  RunStatus,
  SaveArtifacts,
  Suite,
  Team,
  TeamPlan,
  TeamUser,
  Test,
  User,
} from "../../server/types";
import { cuid, minutesFromNow } from "../../server/utils";

type BuildApiKey = {
  i?: number;
  name?: string;
  team_id?: string;
  token_digest?: string;
};

type BuildEnvironmentVariable = {
  group_id?: string;
  i?: number;
  name?: string;
  team_id?: string;
  value?: string;
};

type BuildGitHubCommitStatus = {
  i?: number;
};

type BuildGroup = {
  deployment_branches?: string;
  deployment_environment?: DeploymentEnvironment;
  deployment_integration_id?: string;
  i?: number;
  is_default?: boolean;
  name?: string;
  next_at?: string | null;
  alert_integration_id?: string;
  repeat_minutes?: number | null;
  team_id?: string;
};

type BuildIntegration = {
  github_installation_id?: number;
  github_repo_id?: number;
  github_repo_name?: string;
  i?: number;
  slack_channel?: string;
  team_id?: string;
  type?: IntegrationType;
};

type BuildInvite = {
  accepted_at?: string;
  email?: string;
  expires_at?: string;
  i?: number;
  team_id?: string;
};

type BuildRun = {
  code?: string;
  completed_at?: string;
  created_at?: string;
  i?: number;
  started_at?: string;
  status?: RunStatus;
  suite_id?: string;
  test_id?: string;
};

type BuildRunner = {
  api_key?: string;
  created_at?: string;
  deleted_at?: string;
  deployed_at?: string;
  health_checked_at?: string;
  i?: number;
  location?: string;
  ready_at?: string;
  run_id?: string;
  session_expires_at?: string;
  test_id?: string;
};

type BuildSuite = {
  alert_sent_at?: string;
  created_at?: string;
  creator_id?: string;
  group_id?: string;
  team_id?: string;
  i?: number;
};

type BuildTeam = {
  i?: number;
  is_enabled?: boolean;
  name?: string;
  plan?: TeamPlan;
};

type BuildTeamUser = {
  team_id?: string;
  i?: number;
  user_id?: string;
};

type BuildTest = {
  code?: string;
  creator_id?: string;
  deleted_at?: string;
  i?: number;
  id?: string;
  is_enabled?: boolean;
  name?: string;
  runner_locations?: string[];
  runner_requested_at?: string;
  team_id?: string;
  url?: string;
  version?: number;
};

type BuildUser = {
  i?: number;
  is_enabled?: boolean;
};

export const buildArtifacts = (): SaveArtifacts => ({
  gifUrl: "gif_url",
  logsUrl: "logs_url",
  videoUrl: "video_url",
});

export const buildApiKey = ({
  i,
  name,
  team_id,
  token_digest,
}: BuildApiKey): ApiKey => {
  const finalI = i || 1;

  return {
    created_at: minutesFromNow(),
    id: `apiKey${finalI === 1 ? "" : i}Id`,
    last_used_at: null,
    name: name || "My API Key",
    team_id: team_id || "teamId",
    token_digest: token_digest || cuid(),
    token_end: "abcd",
  };
};

export const buildEnvironmentVariable = ({
  group_id,
  i,
  name,
  team_id,
  value,
}: BuildEnvironmentVariable): EnvironmentVariable => {
  const finalI = i || 1;

  return {
    created_at: minutesFromNow(),
    group_id: group_id || "groupId",
    id: `environmentVariable${finalI === 1 ? "" : i}Id`,
    name: name || `ENV_VARIABLE${finalI === 1 ? "" : "_" + i}`,
    team_id: team_id || "teamId",
    value: encrypt(value || "secret"),
  };
};

export const buildGitHubCommitStatus = ({
  i,
}: BuildGitHubCommitStatus): GitHubCommitStatus => {
  const finalI = i || 1;

  return {
    completed_at: null,
    context: "context",
    deployment_url: "url",
    github_installation_id: 123,
    group_id: "groupId",
    id: `gitHubCommitStatus${finalI === 1 ? "" : i}Id`,
    owner: "qawolf",
    repo: "repo",
    sha: "sha",
    suite_id: "suiteId",
  };
};

export const buildGroup = ({
  deployment_branches,
  deployment_environment,
  deployment_integration_id,
  i,
  is_default,
  name,
  next_at,
  alert_integration_id,
  repeat_minutes,
  team_id,
}: BuildGroup): Group => {
  const finalI = i || 1;

  return {
    creator_id: "userId",
    deleted_at: null,
    deployment_branches: deployment_branches || null,
    deployment_environment: deployment_environment || null,
    deployment_integration_id: deployment_integration_id || null,
    id: `group${finalI === 1 ? "" : i}Id`,
    alert_integration_id: alert_integration_id || null,
    is_default: is_default === undefined ? false : is_default,
    is_email_enabled: true,
    name: name || `group${finalI}`,
    next_at: next_at || null,
    repeat_minutes: repeat_minutes === undefined ? 60 : repeat_minutes,
    team_id: team_id || "teamId",
  };
};

export const buildGroupTest = (): GroupTest => {
  return { group_id: "groupId", id: "groupTestId", test_id: "testId" };
};

export const buildInvite = ({
  accepted_at,
  email,
  expires_at,
  i,
  team_id,
}: BuildInvite): Invite => {
  const finalI = i || 1;

  return {
    accepted_at: accepted_at || null,
    creator_id: "userId",
    email: email || "spirit@qawolf.com",
    expires_at: expires_at || new Date("2100").toISOString(),
    id: `invite${finalI === 1 ? "" : i}Id`,
    team_id: team_id || "teamId",
    wolf_name: "Bridger",
    wolf_number: 13,
    wolf_variant: "husky",
  };
};

export const buildIntegration = ({
  github_installation_id,
  github_repo_id,
  github_repo_name,
  i,
  slack_channel,
  team_id,
  type,
}: BuildIntegration): Integration => {
  const finalI = i || 1;

  return {
    github_installation_id: github_installation_id || null,
    github_repo_id: github_repo_id || null,
    github_repo_name: github_repo_name || null,
    id: `integration${finalI === 1 ? "" : i}Id`,
    settings_url: "settingsUrl",
    slack_channel: slack_channel || "#channel",
    team_id: team_id || "teamId",
    team_name: "QA Wolf",
    type: type || "slack",
    webhook_url: "webhookUrl",
  };
};

export const buildRun = ({
  code,
  completed_at,
  created_at,
  i,
  started_at,
  status,
  suite_id,
  test_id,
}: BuildRun): Run => {
  const finalI = i || 1;

  return {
    code: code || 'const x = "hello"',
    completed_at,
    created_at: created_at || undefined,
    current_line: 1,
    id: `run${finalI === 1 ? "" : i}Id`,
    started_at: started_at || undefined,
    status: status || "created",
    suite_id: suite_id || null,
    test_id: test_id || "testId",
  };
};

export const buildRunner = ({
  api_key,
  created_at,
  deleted_at,
  deployed_at,
  i,
  health_checked_at,
  location,
  ready_at,
  run_id,
  session_expires_at,
  test_id,
}: BuildRunner): Runner => {
  const finalI = i || 1;

  return {
    api_key: api_key || null,
    created_at: created_at || minutesFromNow(),
    deleted_at: deleted_at || null,
    deployed_at: deployed_at || null,
    id: `runner${finalI === 1 ? "" : i}Id`,
    health_checked_at: health_checked_at || null,
    location: location || "westus2",
    ready_at: ready_at || null,
    run_id: run_id || null,
    session_expires_at: session_expires_at || null,
    test_id: test_id || null,
  };
};

export const buildSuite = ({
  alert_sent_at,
  created_at,
  creator_id,
  group_id,
  team_id,
  i,
}: BuildSuite): Suite => {
  const finalI = i || 1;

  return {
    alert_sent_at: alert_sent_at || null,
    created_at: created_at || minutesFromNow(),
    creator_id: creator_id || null,
    environment_variables: null,
    group_id: group_id || "groupId",
    id: `suite${finalI === 1 ? "" : i}Id`,
    team_id: team_id || "teamId",
  };
};

export const buildTeam = ({ i, is_enabled, name, plan }: BuildTeam): Team => {
  const finalI = i || 1;

  return {
    id: `team${finalI === 1 ? "" : i}Id`,
    is_enabled: is_enabled === undefined ? true : is_enabled,
    name: name || "Awesome Company",
    plan: plan || "free",
    stripe_customer_id: null,
    stripe_subscription_id: null,
    renewed_at: null,
  };
};

export const buildTeamUser = ({
  team_id,
  i,
  user_id,
}: BuildTeamUser): TeamUser => {
  const finalI = i || 1;

  return {
    team_id: team_id || "teamId",
    id: `teamUser${finalI === 1 ? "" : i}Id`,
    role: "admin",
    user_id: user_id || "userId",
  };
};

export const buildTest = ({
  team_id,
  code,
  creator_id,
  deleted_at,
  i,
  id,
  is_enabled,
  name,
  runner_locations,
  runner_requested_at,
  url,
  version,
}: BuildTest): Test => {
  const finalI = i || 1;
  const timestamp = minutesFromNow();

  return {
    team_id: team_id || "teamId",
    created_at: timestamp,
    creator_id: creator_id || "userId",
    code: code || 'const x = "hello"',
    deleted_at: deleted_at || null,
    id: id || `test${finalI === 1 ? "" : i}Id`,
    is_enabled: is_enabled === undefined ? true : is_enabled,
    name: name || `test${finalI === 1 ? "" : i}`,
    runner_locations: runner_locations
      ? JSON.stringify(runner_locations)
      : null,
    runner_requested_at: runner_requested_at || null,
    updated_at: timestamp,
    url: url || "https://github.com",
    version: version || 11,
  };
};

export const buildUser = ({ i, is_enabled }: BuildUser): User => {
  const finalI = i || 1;

  return {
    avatar_url: "url",
    email: `user${finalI}@qawolf.com`,
    github_id: finalI,
    github_login: `github_${finalI}`,
    id: `user${finalI === 1 ? "" : i}Id`,
    is_enabled: is_enabled !== undefined ? is_enabled : true,
    login_code_digest: null,
    login_code_expires_at: null,
    name: null,
    onboarded_at: minutesFromNow(),
    wolf_name: `Wolf${finalI}`,
    wolf_number: finalI,
    wolf_variant: "brown",
  };
};

export const deleteUser = async (
  id: string,
  trx: Transaction
): Promise<void> => {
  const teamUsers: TeamUser[] = await trx
    .select("*")
    .from("team_users")
    .where({ user_id: id });

  await trx("groups")
    .whereIn(
      "team_id",
      teamUsers.map((t) => t.team_id)
    )
    .del();

  await trx("team_users")
    .whereIn(
      "id",
      teamUsers.map((t) => t.id)
    )
    .del();
  await trx("teams")
    .whereIn(
      "id",
      teamUsers.map((t) => t.team_id)
    )
    .del();

  await trx("users").where({ id }).del();
};

export const logger = new Logger();

export const testContext = {
  api_key: null,
  ip: "127.0.0.1",
  logger,
  teams: [buildTeam({})],
  user: buildUser({}),
};
