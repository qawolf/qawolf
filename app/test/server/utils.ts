import { Transaction } from "knex";

import { Logger } from "../../server/Logger";
import { encrypt } from "../../server/models/encrypt";
import {
  DeploymentProvider,
  Email,
  Environment,
  EnvironmentVariable,
  GitHubCommitStatus,
  Group,
  Integration,
  IntegrationType,
  Invite,
  Job,
  JobName,
  PullRequestComment,
  Run,
  Runner,
  RunStatus,
  SaveArtifacts,
  Suite,
  Team,
  TeamPlan,
  TeamUser,
  Test,
  TestTrigger,
  Trigger,
  User,
} from "../../server/types";
import { buildApiKey, cuid } from "../../server/utils";
import { minutesFromNow } from "../../shared/utils";

type BuildEmail = {
  created_at?: string;
  i?: number;
  is_outbound?: boolean;
  team_id?: string;
  to?: string;
};

type BuildEnvironment = {
  i?: number;
  name?: string;
  team_id?: string;
};

type BuildEnvironmentVariable = {
  environment_id?: string;
  i?: number;
  name?: string;
  team_id?: string;
  value?: string;
};

type BuildGitHubCommitStatus = {
  i?: number;
};

type BuildGroup = {
  i?: number;
  name?: string;
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

type BuildJob = {
  i?: number;
  name?: JobName;
  started_at?: string;
};

type BuildPullRequestComment = {
  i?: number;
  suite_id?: string;
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
  created_at?: string;
  creator_id?: string;
  environment_id?: string;
  i?: number;
  team_id?: string;
  trigger_id?: string;
};

type BuildTeam = {
  apiKey?: string;
  helpers?: string;
  i?: number;
  inbox?: string;
  is_enabled?: boolean;
  last_synced_at?: string;
  limit_reached_at?: string;
  name?: string;
  plan?: TeamPlan;
  renewed_at?: string;
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
  group_id?: string;
  guide?: string;
  i?: number;
  id?: string;
  is_enabled?: boolean;
  name?: string;
  path?: string;
  runner_locations?: string[];
  runner_requested_at?: string;
  team_id?: string;
  version?: number;
};

type BuildTrigger = {
  deployment_branches?: string;
  deployment_environment?: string;
  deployment_integration_id?: string;
  deployment_provider?: DeploymentProvider;
  environment_id?: string;
  i?: number;
  name?: string;
  next_at?: string | null;
  repeat_minutes?: number | null;
  team_id?: string;
};

type BuildUser = {
  i?: number;
  is_enabled?: boolean;
};

export const buildArtifacts = (): SaveArtifacts => ({
  gifUrl: "gif_url",
  jsonUrl: "json_url",
  logsUrl: "logs_url",
  videoUrl: "video_url",
});

export const buildEmail = ({
  created_at,
  i,
  is_outbound,
  team_id,
  to,
}: BuildEmail): Email => {
  const finalI = i || 1;

  return {
    created_at: created_at || new Date().toISOString(),
    from: "testing@email.com",
    html: "html",
    id: `email${finalI === 1 ? "" : i}Id`,
    is_outbound: is_outbound || false,
    subject: "subject",
    team_id: team_id || "teamId",
    text: "text",
    to: to || "spirit@test.com",
  };
};

export const buildEnvironment = ({
  i,
  name,
  team_id,
}: BuildEnvironment): Environment => {
  const finalI = i || 1;

  return {
    id: `environment${finalI === 1 ? "" : i}Id`,
    name: name || "Staging",
    team_id: team_id || "teamId",
  };
};

export const buildEnvironmentVariable = ({
  environment_id,
  i,
  name,
  team_id,
  value,
}: BuildEnvironmentVariable): EnvironmentVariable => {
  const finalI = i || 1;

  return {
    created_at: minutesFromNow(),
    environment_id: environment_id || "environmentId",
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
    id: `gitHubCommitStatus${finalI === 1 ? "" : i}Id`,
    owner: "qawolf",
    repo: "repo",
    sha: "sha",
    suite_id: "suiteId",
    trigger_id: "triggerId",
  };
};

export const buildGroup = ({ i, name, team_id }: BuildGroup): Group => {
  const finalI = i || 1;

  return {
    id: `group${finalI === 1 ? "" : i}Id`,
    name: name || `group${finalI}`,
    team_id: team_id || "teamId",
  };
};

export const buildTestTrigger = (): TestTrigger => {
  return { id: "testTriggerId", test_id: "testId", trigger_id: "triggerId" };
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

export const buildJob = ({ i, name, started_at }: BuildJob): Job => {
  const finalI = i || 1;

  return {
    completed_at: null,
    id: `job${finalI === 1 ? "" : i}Id`,
    name: name || "pull_request_comment",
    started_at: started_at || null,
    suite_id: "suiteId",
  };
};

export const buildPullRequestComment = ({
  i,
  suite_id,
}: BuildPullRequestComment): PullRequestComment => {
  const finalI = i || 1;

  return {
    body: "# Comment",
    comment_id: 123,
    deployment_integration_id: "integrationId",
    id: `pullRequestComment${finalI === 1 ? "" : i}Id`,
    last_commit_at: new Date().toISOString(),
    pull_request_id: 11,
    suite_id: suite_id || "suiteId",
    trigger_id: "triggerId",
    user_id: "userId",
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
    retries: null,
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
  created_at,
  creator_id,
  environment_id,
  team_id,
  trigger_id,
  i,
}: BuildSuite): Suite => {
  const finalI = i || 1;

  return {
    branch: null,
    created_at: created_at || minutesFromNow(),
    creator_id: creator_id || null,
    environment_id: environment_id || null,
    environment_variables: null,
    helpers: "",
    id: `suite${finalI === 1 ? "" : i}Id`,
    team_id: team_id || "teamId",
    trigger_id: trigger_id || "triggerId",
  };
};

export const buildTeam = ({
  apiKey,
  helpers,
  i,
  inbox,
  is_enabled,
  last_synced_at,
  limit_reached_at,
  name,
  plan,
  renewed_at,
}: BuildTeam): Team => {
  const finalI = i || 1;

  return {
    alert_integration_id: null,
    api_key: apiKey ? encrypt(apiKey) : encrypt(buildApiKey()),
    helpers: helpers || "",
    helpers_version: 0,
    id: `team${finalI === 1 ? "" : i}Id`,
    inbox: inbox || `${cuid()}@dev.qawolf.email`,
    is_email_alert_enabled: true,
    is_enabled: is_enabled === undefined ? true : is_enabled,
    last_synced_at: last_synced_at || null,
    limit_reached_at: limit_reached_at || null,
    name: name || "Awesome Company",
    next_trigger_id: cuid(),
    plan: plan || "free",
    renewed_at: renewed_at || new Date().toISOString(),
    stripe_customer_id: null,
    stripe_subscription_id: null,
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
  group_id,
  guide,
  i,
  id,
  is_enabled,
  name,
  path,
  runner_locations,
  runner_requested_at,
  version,
}: BuildTest): Test => {
  const finalI = i || 1;
  const timestamp = minutesFromNow();

  return {
    created_at: timestamp,
    creator_id: creator_id || "userId",
    code: code || 'const x = "hello"',
    deleted_at: deleted_at || null,
    group_id: group_id || null,
    guide: guide || null,
    id: id || `test${finalI === 1 ? "" : i}Id`,
    is_enabled: is_enabled === undefined ? true : is_enabled,
    name: path ? null : name || `test${finalI === 1 ? "" : i}`,
    path: path || null,
    runner_locations: runner_locations
      ? JSON.stringify(runner_locations)
      : null,
    runner_requested_at: runner_requested_at || null,
    team_id: team_id || "teamId",
    updated_at: timestamp,
    version: version || 11,
  };
};

export const buildTrigger = ({
  deployment_branches,
  deployment_environment,
  deployment_integration_id,
  deployment_provider,
  environment_id,
  i,
  name,
  next_at,
  repeat_minutes,
  team_id,
}: BuildTrigger): Trigger => {
  const finalI = i || 1;

  return {
    color: "#4545E5",
    creator_id: "userId",
    deleted_at: null,
    deployment_branches: deployment_branches || null,
    deployment_environment: deployment_environment || null,
    deployment_integration_id: deployment_integration_id || null,
    deployment_provider: deployment_provider || null,
    environment_id: environment_id || null,
    id: `trigger${finalI === 1 ? "" : i}Id`,
    name: name || `trigger${finalI}`,
    next_at: next_at || null,
    repeat_minutes: repeat_minutes === undefined ? 60 : repeat_minutes,
    team_id: team_id || "teamId",
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
    last_seen_at: minutesFromNow(),
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

  await trx("environments")
    .whereIn(
      "team_id",
      teamUsers.map((t) => t.team_id)
    )
    .del();

  await trx("triggers")
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
