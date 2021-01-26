// GraphQL Types
export type ApiKey = {
  created_at: string;
  id: string;
  last_used_at: string | null;
  name: string;
  token: string | null;
  token_end: string;
};

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
  id: string;
  name: string;
};

export type Group = {
  alert_integration_id: string | null;
  created_at: string;
  deployment_branches: string | null;
  deployment_environment: DeploymentEnvironment | null;
  deployment_integration_id: string | null;
  id: string;
  is_default: boolean;
  is_email_enabled: boolean;
  name: string;
  next_at: string | null;
  repeat_minutes: number | null;
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
  current_line: number | null;
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

export type Suite = {
  created_at: string;
  group_id: string;
  id: string;
  runs: SuiteRun[];
  team_id: string;
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
  helpers: string;
  is_enabled: boolean;
  renewed_at: string | null;
};

export type Test = {
  code: string;
  deleted_at: string | null;
  id: string;
  is_enabled: boolean;
  name: string;
  updated_at: string;
  url: string;
  version: number;
};

export type TestWithSummary = Test & {
  groups: SelectedGroup[];
  summary: {
    gif_url: string | null;
    last_runs: SuiteRun[];
  };
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
export type Action = {
  id: string;
  x: number;
  y: number;
};

export type AuthMode = "logIn" | "signUp";

export type CreateCode = {
  code: string;
  test_id: string | null;
};

export type GroupTests = {
  [testId: string]: string[];
};

export type Modal =
  | "apiKeys"
  | "deployment"
  | "envVariables"
  | "deleteGroup"
  | "deleteTest"
  | "teamSettings";

export type NavigationOption = "code" | "logs" | "helpers";

export type NavigationType = "dark" | "light";

export type SelectedGroup = {
  id: string;
  name: string;
};

export type SelectedIntegration = {
  github_repo_name: string;
  id: string;
};

export type SelectedTest = {
  id: string;
  name: string;
};

export type UserSubscription = {
  email: string;
  wolfName: string;
  wolfVariant: string;
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
export type ImageGroup = "wolf";

type SignUp = {
  inviteId?: string | null;
  redirectUri?: string | null;
};

type ModalState = {
  group?: SelectedGroup;
  integration?: SelectedIntegration;
  name: Modal | null;
  teamId?: string;
  tests?: SelectedTest[];
};

export type State = {
  dashboardUri: string | null;
  email: string | null;
  environmentId: string | null;
  error: string | null;
  groupId: string | null;
  image: { wolf: number };
  modal: ModalState;
  run: RunOptions | null;
  signUp: SignUp;
  teamId: string | null;
};
