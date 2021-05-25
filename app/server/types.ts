import knex, { Transaction } from "knex";

import { Logger } from "./Logger";

// AWS types
export type SaveArtifacts = {
  gifUrl: string | null;
  jsonUrl: string | null;
  logsUrl: string;
  videoUrl: string | null;
};

// Context type
export type Context = {
  api_key: string | null;
  db: knex;
  ip: string | null;
  logger: Logger;
  teams: Team[] | null;
  user: User | null;
};

// GitHub types
export type GitHubBranch = {
  is_default: boolean;
  name: string;
};

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
  subscribed_at?: string;
};

export type GitHubFile = {
  path: string;
  sha: string;
  text: string;
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
type WolfFields = {
  wolf_name?: string | null;
  wolf_number?: number | null;
  wolf_variant?: string | null;
};

export type CreateUserWithEmail = WolfFields & {
  email: string;
  login_code: string;
  subscribed_at?: string;
};

export type CreateUserWithGitHub = GitHubFields & WolfFields;

export type CreatedSuite = {
  runs: Run[];
  suite: Suite;
};

export type DeploymentProvider = "netlify" | "render" | "vercel";

export type Email = {
  created_at?: string;
  from: string;
  html: string;
  id: string;
  is_outbound: boolean;
  subject: string;
  team_id: string;
  text: string;
  to: string;
};

export type Environment = {
  created_at?: string;
  id: string;
  name: string;
  team_id: string;
  updated_at?: string;
};

export type EnvironmentVariable = {
  created_at?: string;
  environment_id: string;
  id: string;
  is_system?: boolean;
  name: string;
  team_id: string;
  value: string;
  updated_at?: string;
};

export type File = {
  content: string;
  id: string;
  is_read_only: boolean;
  path: string;
};

export type FormattedVariables = { [name: string]: string };

export type GitHubCommitStatus = {
  completed_at: string | null;
  context: string;
  created_at?: string;
  deployment_url: string;
  github_installation_id: number;
  id: string;
  owner: string;
  repo: string;
  sha: string;
  suite_id: string;
  trigger_id: string;
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

export type IntegrationType = "github" | "github_sync" | "slack";

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

export type JobName = "alert" | "github_commit_status" | "pull_request_comment";

export type Job = {
  completed_at: string | null;
  created_at?: string;
  id: string;
  name: JobName;
  started_at: string | null;
  suite_id: string;
  updated_at?: string;
};

export type ModelOptions = {
  db: knex | Transaction;
  logger: Logger;
};

export type PullRequestComment = {
  created_at?: string;
  body: string;
  comment_id: number;
  deployment_integration_id: string;
  id: string;
  last_commit_at: string;
  pull_request_id: number;
  suite_id: string;
  trigger_id: string;
  user_id: string;
  updated_at?: string;
};

export type RunStatus = "created" | "fail" | "pass";

export type Run = {
  created_at?: string;
  code: string;
  completed_at?: string;
  current_line: number | null;
  error?: string;
  id: string;
  retries?: number;
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
  test_branch?: string | null;
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

export type StatusCounts = {
  created: number;
  fail: number;
  pass: number;
};

export type Subscriber = {
  email: string;
  id: string;
};

export type Suite = {
  branch: string | null;
  created_at: string;
  creator_id: string | null;
  environment_id: string | null;
  environment_variables: string | null;
  helpers: string;
  id: string;
  is_api: boolean;
  team_id: string;
  trigger_id: string;
  updated_at?: string;
};

export type SuiteRun = {
  gif_url: string | null;
  id: string;
  is_test_deleted: boolean;
  status: RunStatus;
  test_id: string;
  test_name: string;
  test_tags?: Tag[];
};

export type Tag = {
  created_at?: string;
  color: string;
  id: string;
  name: string;
  team_id: string;
  updated_at?: string;
};

export type TagsForTest = {
  tags: Tag[];
  test_id: string;
};

export type TagTest = {
  created_at?: string;
  id: string;
  tag_id: string;
  test_id: string;
  updated_at?: string;
};

export type TagTrigger = {
  id: string;
  tag_id: string;
  trigger_id: string;
};

export type TeamPlan = "business" | "custom" | "free";

export type Team = {
  alert_integration_id: string | null;
  alert_only_on_failure?: boolean;
  api_key: string;
  base_price?: number | null;
  created_at?: string;
  default_branches?: string | null;
  deleted_at?: string | null;
  forward_email?: string | null;
  git_sync_integration_id?: string | null;
  id: string;
  inbox: string;
  helpers: string;
  is_email_alert_enabled: boolean;
  is_enabled: boolean;
  last_synced_at: string | null;
  limit_reached_at: string | null;
  metered_price?: number | null;
  name: string;
  plan: TeamPlan;
  renewed_at: string;
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
  creator_id: string | null;
  code: string;
  deleted_at: string | null;
  guide?: string | null;
  id: string;
  is_enabled: boolean;
  name: string | null;
  path: string | null;
  runner_locations?: string | null;
  runner_requested_at?: string | null;
  runner_requested_branch?: string;
  team_id: string;
  updated_at: string;
  url?: string;
};

export type Trigger = {
  color: string;
  created_at?: string;
  creator_id: string;
  deleted_at: string | null;
  deployment_branches?: string | null;
  deployment_environment?: string | null;
  deployment_integration_id: string | null;
  deployment_preview_url?: string | null;
  deployment_provider?: DeploymentProvider | null;
  environment_id: string | null;
  id: string;
  name: string;
  next_at: string | null;
  render_environment?: string | null;
  repeat_minutes: number | null;
  start_at?: string;
  team_id: string;
  timezone_id?: string;
  updated_at?: string;
};

export type User = {
  avatar_url: string | null;
  created_at?: string;
  email: string;
  github_id: number | null;
  github_login: string | null;
  id: string;
  is_enabled?: boolean;
  last_seen_at: string;
  login_code_digest: string | null;
  login_code_expires_at: string | null;
  name: string | null;
  onboarded_at: string | null;
  subscribed_at?: string | null;
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

export type CreateEnvironmentMutation = {
  name: string;
  team_id: string;
};

export type CreateEnvironmentVariableMutation = {
  environment_id: string;
  name: string;
  value: string;
};

export type CreateGitHubIntegrationsMutation = {
  installation_id: number;
  is_sync: boolean;
  team_id: string;
};

export type CreateInviteMutation = {
  emails: string[];
  team_id: string;
};

export type CreateSlackIntegrationMutation = {
  redirect_uri: string;
  slack_code: string;
  team_id: string;
};

export type CreateStripeCheckoutSessionMutation = {
  app_url: string;
  cancel_uri: string;
  team_id: string;
};

export type CreateStripePortalSessionMutation = {
  app_url: string;
  return_uri: string;
  team_id: string;
};

export type CreateSubscriberMutation = {
  email: string;
};

export type CreateSuiteMutation = {
  branch: string | null;
  environment_id: string | null;
  environment_variables: string | null;
  test_ids: string[];
};

export type CreateTagMutation = {
  name: string;
  team_id: string;
  test_ids: string[] | null;
};

export type CreateTestMutation = {
  branch?: string | null;
  guide: string | null;
  team_id: string;
  url: string;
};

export type CreateTriggerMutation = {
  deployment_branches: string | null;
  deployment_environment: string | null;
  deployment_integration_id: string | null;
  deployment_preview_url: string | null;
  deployment_provider: DeploymentProvider | null;
  environment_id: string | null;
  name: string;
  repeat_minutes: number | null;
  tag_ids: string[] | null;
  team_id: string;
};

export type CreateUrlMutation = {
  redirect_uri: string;
};

export type DeleteTestsMutation = {
  branch: string | null;
  ids: string[];
};

export type RunnerRun = {
  artifacts: SaveArtifacts;
  code: string;
  env: string;
  helpers: string;
  id: string;
  test_id: string;
};

export type RunTestStatus = {
  message: string;
  pass: boolean;
};

export type CommitEditor = {
  helpers: File;
  test: File;
};

export type CommitEditorMutation = {
  branch: string;
  code?: string | null;
  helpers?: string | null;
  path?: string | null;
  test_id: string;
};

export type SendEmailMutation = {
  from: string;
  html?: string;
  subject: string;
  text?: string;
  to: string;
};

export type SendLoginCodeMutation = {
  email: string;
  invite_id?: string | null;
  is_subscribed?: boolean;
};

export type SendLoginCode = {
  email: string;
};

export type SendSlackUpdateMutation = {
  message: string;
};

export type SignInWithEmailMutation = {
  email: string;
  login_code: string;
};

export type SignInWithGitHubMutation = {
  github_code: string;
  github_state: string;
  invite_id?: string | null;
  is_subscribed?: boolean;
};

export type UpdateEnvironmentMutation = {
  id: string;
  name: string;
};

export type UpdateFileMutation = {
  content?: string | null;
  id: string;
  path?: string | null;
};

export type UpdateRunMutation = {
  error?: string;
  current_line: number | null;
  id: string;
  status: RunStatus;
};

export type UpdateRunnerMutation = {
  id: string;
  is_healthy?: boolean;
  is_ready?: boolean;
};

export type UpdateEnvironmentVariableMutation = {
  id: string;
  name: string;
  value: string;
};

export type UpdateTagMutation = {
  id: string;
  name: string;
};

export type UpdateTagTestsMutation = {
  add_tag_id?: string | null;
  remove_tag_id?: string | null;
  test_ids: string[];
};

export type UpdateTeamMutation = {
  alert_integration_id?: string | null;
  alert_only_on_failure?: boolean;
  id: string;
  is_email_alert_enabled?: boolean;
  name?: string | null;
};

export type UpdateTriggerMutation = {
  deployment_branches?: string | null;
  deployment_environment?: string | null;
  deployment_integration_id?: string | null;
  deployment_preview_url?: string | null;
  deployment_provider?: DeploymentProvider | null;
  environment_id?: string | null;
  id: string;
  name?: string;
  repeat_minutes?: number | null;
  tag_ids?: string[] | null;
};

export type UpdateUserMutation = {
  onboarded_at: string;
};

export type UpdateWolfMutation = {
  name: string;
  user_id: string;
};

export type UseTestSessionMutation = {
  test_id: string;
};

// Query types
export type CurrentUser = User & {
  intercom_hash: string;
  teams: Team[];
};

export type EmailQuery = {
  created_after: string;
  to: string;
};

export type EnvironmentIdQuery = {
  environment_id: string;
};

export type FileQuery = {
  branch?: string | null;
  id: string;
};

export type IdQuery = {
  id: string;
};

export type Onboarding = {
  has_completed_tutorial: boolean;
  has_created_test: boolean;
  has_invited_user: boolean;
  has_trigger: boolean;
};

export type RunResult = Run & {
  environment_id: string | null;
  logs_url: string | null;
  video_url: string | null;
};

export type RunWithGif = Run & {
  gif_url: string | null;
};

export type RunnerResult = {
  api_key?: string;
  ws_url?: string;
};

export type SuiteResult = Suite & {
  environment_name: string | null;
  trigger: Trigger | null;
};

export type TeamIdQuery = {
  team_id: string;
};

export type TestIdsQuery = {
  test_ids: string[];
};

export type TestSummariesQuery = {
  test_ids: string[];
};

export type TestSummary = {
  gif_url: string | null;
  last_runs: RunWithGif[];
  test_id: string;
};

export type TestsQuery = {
  branch: string | null;
  team_id: string;
};

export type TriggerIdQuery = {
  trigger_id: string;
};

export type Wolf = {
  name: string;
  number: number;
  variant: string;
};

export type WolfQuery = {
  user_id: string;
};
