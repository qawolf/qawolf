// GraphQL Types
export type AuthenticatedUser = {
  access_token: string;
  user: User;
};

export type DeploymentEnvironment = "all" | "preview" | "production";

export type Env = { [name: string]: string };

export type Environment = {
  id: string;
  name: string;
};

export type EnvironmentVariable = {
  created_at: string;
  environment_id: string;
  id: string;
  name: string;
  value: string;
};

export type Integration = {
  github_repo_name: string;
  id: string;
  slack_channel: string | null;
  team_name: string | null;
  type: "github" | "slack";
};

export type Invite = {
  email: string;
  id: string;
  team_id: string;
  wolf_name: string;
  wolf_number: number;
  wolf_variant: string;
};

export type RunStatus = "created" | "fail" | "pass";

export type Run = {
  code: string;
  completed_at: string | null;
  created_at: string;
  current_line: number | null;
  environment_id: string | null;
  id: string;
  logs_url: string | null;
  started_at: string | null;
  status: RunStatus;
  suite_id: string | null;
  test_id: string;
  video_url: string | null;
};

export type Runner = {
  api_key: string | null;
  ws_url: string | null;
};

export type ShortSuite = {
  created_at: string;
  environment_id: string | null;
  environment_variables: string | null;
  id: string;
  team_id: string;
  trigger_color: string | null;
  trigger_id: string | null;
  trigger_name: string | null;
};

export type Suite = ShortSuite & {
  runs: SuiteRun[];
};

export type SuiteRun = {
  completed_at: string | null;
  gif_url: string | null;
  id: string;
  is_test_deleted: boolean;
  started_at: string | null;
  status: RunStatus;
  test_id: string;
  test_name: string;
};

export type ShortTeam = {
  id: string;
  name: string;
};

export type Team = ShortTeam & {
  alert_integration_id: string | null;
  api_key: string;
  helpers: string;
  inbox: string;
  is_email_alert_enabled: boolean;
  is_enabled: boolean;
  next_trigger_id: string;
  renewed_at: string | null;
};

export type ShortTest = {
  id: string;
  name: string;
};

export type Test = ShortTest & {
  code: string;
  deleted_at: string | null;
  is_enabled: boolean;
  updated_at: string;
  version: number;
};

export type TestHistoryRun = {
  created_at: string;
  id: string;
  started_at: string;
  status: RunStatus;
};

export type TestSummaryRun = {
  created_at: string;
  gif_url: string | null;
  id: string;
  status: RunStatus;
};

export type TestSummary = {
  gif_url: string | null;
  last_runs: TestSummaryRun[];
  test_id: string;
};

export type Trigger = {
  color: string;
  created_at: string;
  deployment_branches: string | null;
  deployment_environment: DeploymentEnvironment | null;
  deployment_integration_id: string | null;
  environment_id: string | null;
  id: string;
  name: string;
  next_at: string | null;
  repeat_minutes: number | null;
};

export type User = {
  avatar_url: string | null;
  email: string;
  id: string;
  onboarded_at: string | null;
  teams: ShortTeam[];
  wolf_name: string;
  wolf_number: number;
  wolf_variant: string;
};

// Component Types
export type AuthMode = "logIn" | "signUp";

export type CreateCode = {
  code: string;
  test_id: string | null;
};

export type Modal =
  | "createTest"
  | "environments"
  | "deleteTests"
  | "teamSettings"
  | "triggers";

export type NavigationOption = "code" | "logs" | "helpers";

export type NavigationType = "dark" | "light";

export type SelectedTest = {
  id: string;
  name: string;
};

export type Side = "left" | "right";

export type TestTriggers = {
  test_id: string;
  trigger_ids: string[];
};

export type TriggerFields = {
  deployment_branches: string | null;
  deployment_environment: DeploymentEnvironment | null;
  deployment_integration_id: string | null;
  environment_id: string | null;
  name: string;
  repeat_minutes: number | null;
};

export type ValueProp = {
  detail: string;
  message: string;
};

export type Wolf = {
  name: string;
  number: number;
  variant: string;
};

// Runner Types
export type CodeUpdate = {
  code: string;
  generated?: boolean;
  test_id: string;
  version: number;
};

export type Log = {
  message: string;
  severity: "info" | "warning" | "error";
  timestamp: string;
};

export type RunOptions = {
  code: string;
  end_line?: number;
  env: Env;
  helpers?: string;
  restart: boolean;
  run_id?: string;
  start_line?: number;
  test_id?: string;
  version: number;
};

export type RunProgress = {
  code: string;
  completed_at: string | null;
  current_line: number | null;
  run_id?: string;
  start_line?: number;
  status: RunStatus;
};

// State Types
type SignUp = {
  inviteId?: string | null;
  redirectUri?: string | null;
};

type ModalState = {
  name: Modal | null;
  teamId?: string;
  testIds?: string[];
  tests?: SelectedTest[];
};

export type State = {
  dashboardUri: string | null;
  editorSidebarWidth: number;
  email: string | null;
  environmentId: string | null;
  modal: ModalState;
  run: RunOptions | null;
  signUp: SignUp;
  teamId: string | null;
  toast: {
    error?: boolean;
    expiresIn?: number;
    message: string;
  } | null;
};
