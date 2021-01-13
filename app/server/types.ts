import { Transaction } from "knex";

import { Logger } from "./Logger";

// Azure types
export type SaveArtifacts = {
  gifUrl: string | null;
  logsUrl: string;
  videoUrl: string | null;
};

// Context type
export type Context = {
  api_key: string | null;
  ip: string | null;
  logger: Logger;
  teams: Team[] | null;
  user: User | null;
};

// GitHub types
export type GitHubEmail = {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility?: string | null;
};

export type GitHubFields = {
  avatar_url: string;
  email: string;
  github_id: number;
  github_login: string;
  name: string | null;
};

export type GitHubUser = {
  avatar_url: string;
  email: string;
  id: number;
  login: string;
  name: string;
};

// Slack types
export type SlackWebhook = {
  settings_url: string;
  slack_channel: string;
  slack_team: string;
  webhook_url: string;
};

// Model types
export type ApiKey = {
  created_at: string;
  id: string;
  last_used_at: string | null;
  name: string;
  team_id: string;
  token_digest: string;
  token_end: string;
  updated_at?: string;
};

type WolfFields = {
  wolf_name?: string | null;
  wolf_number?: number | null;
  wolf_variant?: string | null;
};

export type CreateUserWithEmail = WolfFields & {
  email: string;
  login_code: string;
};

export type CreateUserWithGitHub = GitHubFields & WolfFields;

export type DeploymentEnvironment = "preview" | "production";

export type EnvironmentVariable = {
  created_at?: string;
  group_id: string;
  id: string;
  is_system?: boolean;
  name: string;
  team_id: string;
  value: string;
  updated_at?: string;
};

export type FormattedVariables = { [name: string]: string };

export type GitHubCommitStatus = {
  completed_at: string | null;
  context: string;
  created_at?: string;
  deployment_url: string;
  github_installation_id: number;
  group_id: string;
  id: string;
  owner: string;
  repo: string;
  sha: string;
  suite_id: string;
  updated_at?: string;
};

export type Invite = {
  accepted_at: string | null;
  created_at?: string;
  creator_id: string;
  email: string;
  expires_at: string;
  id: string;
  team_id: string;
  updated_at?: string;
  wolf_name: string;
  wolf_number: number;
  wolf_variant: string;
};

export type Group = {
  alert_integration_id: string | null;
  created_at?: string;
  creator_id: string;
  deleted_at: string | null;
  deployment_branches?: string | null;
  deployment_environment?: DeploymentEnvironment | null;
  deployment_integration_id: string | null;
  id: string;
  is_default: boolean;
  is_email_enabled: boolean;
  name: string;
  next_at: string | null;
  repeat_minutes: number | null;
  team_id: string;
  updated_at?: string;
};

export type GroupTest = {
  group_id: string;
  id: string;
  test_id: string;
};

export type IntegrationType = "github" | "slack";

export type Integration = {
  created_at?: string;
  github_installation_id?: number | null;
  github_repo_id?: number | null;
  github_repo_name?: string | null;
  id: string;
  settings_url: string | null;
  slack_channel?: string | null;
  team_id: string;
  team_name: string | null;
  type: IntegrationType;
  updated_at?: string;
  webhook_url?: string | null;
};

export type ModelOptions = {
  trx?: Transaction;
  logger: Logger;
};

export type RunStatus = "created" | "fail" | "pass";

export type Run = {
  created_at?: string;
  code: string;
  completed_at?: string;
  current_line: number | null;
  id: string;
  started_at?: string;
  status: RunStatus;
  suite_id: string | null;
  test_id: string;
  updated_at?: string;
};

export type Runner = {
  api_key?: string | null;
  created_at: string;
  deleted_at?: string | null;
  deployed_at?: string | null;
  health_checked_at?: string | null;
  id: string;
  location: string;
  ready_at?: string | null;
  restarted_at?: string | null;
  run_id?: string | null;
  session_expires_at?: string | null;
  test_id?: string | null;
  updated_at?: string;
};

export type RunnerLocation = {
  buffer: number;
  latitude: number;
  longitude: number;
  reserved: number;
};

export type RunnerLocations = Record<string, RunnerLocation>;

export type Suite = {
  alert_sent_at?: string;
  created_at: string;
  creator_id: string | null;
  environment_variables: string | null;
  group_id: string;
  id: string;
  team_id: string;
  updated_at?: string;
};

export type SuiteRun = {
  gif_url: string | null;
  id: string;
  is_test_deleted: boolean;
  status: RunStatus;
  test_id: string;
  test_name: string;
};

export type TeamPlan = "free" | "business";

export type Team = {
  created_at?: string;
  deleted_at?: string | null;
  id: string;
  is_enabled: boolean;
  name: string;
  plan: TeamPlan;
  renewed_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  updated_at?: string;
};

export type TeamUserRole = "admin";

export type TeamUser = {
  id: string;
  role: TeamUserRole;
  team_id: string;
  user_id: string;
};

export type Test = {
  created_at: string;
  creator_id: string;
  code: string;
  deleted_at: string | null;
  id: string;
  is_enabled: boolean;
  name: string;
  runner_locations?: string | null;
  runner_requested_at?: string | null;
  team_id: string;
  url: string;
  updated_at: string;
  version: number;
};

export type TestUpdate = {
  code: string;
  generated?: boolean;
  id: string;
  version: number;
};

export type User = {
  avatar_url: string | null;
  created_at?: string;
  email: string;
  github_id: number | null;
  github_login: string | null;
  id: string;
  is_enabled?: boolean;
  login_code_digest: string | null;
  login_code_expires_at: string | null;
  name: string | null;
  onboarded_at: string | null;
  updated_at?: string;
  wolf_name: string;
  wolf_number: number;
  wolf_variant: string;
};

// Mutaton types
export type AuthenticatedUser = {
  access_token: string;
  user: CurrentUser;
};

export type CreateApiKeyMutation = {
  name: string;
  team_id: string;
};

export type CreateGitHubIntegrationsMutation = {
  installation_id: number;
  team_id: string;
};

export type CreateEnvironmentVariableMutation = {
  group_id: string;
  name: string;
  value: string;
};

export type CreateInviteMutation = {
  emails: string[];
  team_id: string;
};

export type CreateSlackIntegrationMutation = {
  group_id: string;
  redirect_uri: string;
  slack_code: string;
};

export type CreateSuiteMutation = {
  group_id: string;
  test_ids?: string[] | null;
};

export type CreateTestMutation = {
  group_id: string | null;
  url: string;
};

export type CreateUrlMutation = {
  redirect_uri: string;
};

export type DeleteGroup = {
  default_group_id: string;
  id: string;
};

export type DeleteTestsMutation = {
  ids: string[];
};

export type InstrumentTestRunMutation = {
  status: RunStatus;
  test_id: string;
};

export type JoinMailingListMutation = {
  email: string;
};

export type RunnerRun = {
  artifacts: SaveArtifacts;
  code: string;
  env: string;
  id: string;
  test_id: string;
  version: number;
};

export type RunTestStatus = {
  message: string;
  pass: boolean;
};

export type SendLoginCodeMutation = {
  email: string;
  invite_id?: string | null;
};

export type SendLoginCode = {
  email: string;
};

export type SignInWithEmailMutation = {
  email: string;
  login_code: string;
};

export type SignInWithGitHubMutation = {
  github_code: string;
  github_state: string;
  invite_id?: string | null;
};

export type UpdateGroupMutation = {
  deployment_branches?: string | null;
  deployment_environment?: DeploymentEnvironment | null;
  deployment_integration_id?: string | null;
  id: string;
  is_email_enabled?: boolean;
  name?: string;
  alert_integration_id?: string | null;
  repeat_minutes?: number | null;
};

export type UpdateGroupTestsMutation = {
  add_group_id: string | null;
  remove_group_id: string | null;
  test_ids: string[];
};

export type UpdateRunMutation = {
  current_line: number | null;
  id: string;
  status: RunStatus;
};

export type UpdateRunnerMutation = {
  id: string;
  is_healthy?: boolean;
  is_ready?: boolean;
};

export type UpdateTeamMutation = {
  id: string;
  name: string;
};

export type UpdateTestMutation = {
  code?: string;
  id: string;
  is_enabled?: boolean;
  name?: string;
  version?: number;
};

export type UpdateUserMutation = {
  onboarded_at: string;
};

export type UseTestSessionMutation = {
  test_id: string;
};

// Query types
export type CurrentUser = User & {
  teams: Team[];
};

export type GroupIdQuery = {
  group_id: string;
};

export type IdQuery = {
  id: string;
};

export type RunResult = Run & {
  logs_url: string | null;
  video_url: string | null;
};

export type RunnerResult = {
  api_key?: string;
  ws_url?: string;
};

export type TeamIdQuery = {
  team_id: string;
};

export type TestQuery = {
  id?: string;
  run_id?: string;
};

export type TestResult = {
  run: RunResult | null;
  test: Test;
};

export type TestSummary = {
  gif_url: string | null;
  last_runs: SuiteRun[];
};

export type Wolf = {
  name: string;
  number: string;
  variant: string;
};
