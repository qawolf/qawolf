import { minutesFromNow } from "../../shared/utils";
import { ClientError } from "../errors";
import {
  buildHelpersForFiles,
  findFilesForBranch,
} from "../services/gitHub/tree";
import {
  CreatedSuite,
  FormattedVariables,
  GitHubFile,
  ModelOptions,
  Suite,
  SuiteResult,
  Test,
  Trigger,
} from "../types";
import { cuid } from "../utils";
import { encrypt } from "./encrypt";
import { createRunsForTests } from "./run";
import { findTeam } from "./team";
import { findEnabledTestsForTrigger } from "./test";
import { findTrigger } from "./trigger";

export type SuiteForTeam = Suite & {
  github_login: string | null;
  name: string;
  repeat_minutes: number | null;
};

type BuildGitUrls = {
  pull_request_id?: number | null;
  repo_name?: string | null;
  sha: string;
};

type BuildTestsForFiles = {
  files: GitHubFile[];
  tests: Test[];
};

type BuildTestsForSuite = {
  branch?: string | null;
  team_id: string;
  tests: Test[];
};

type BuildTestsForSuiteResult = {
  helpers: string;
  tests: Test[];
};

type CreateSuite = {
  branch?: string | null;
  commit_message?: string | null;
  commit_url?: string | null;
  creator_id?: string;
  environment_id?: string | null;
  environment_variables?: FormattedVariables | null;
  helpers: string;
  is_api?: boolean;
  pull_request_url?: string | null;
  tag_names?: string | null;
  team_id: string;
  trigger_id: string;
};

type CreateSuiteForTests = {
  branch?: string | null;
  commit_message?: string | null;
  commit_url?: string | null;
  creator_id?: string;
  environment_id?: string | null;
  environment_variables?: FormattedVariables | null;
  is_api?: boolean;
  pull_request_url?: string | null;
  tag_names?: string | null;
  team_id: string;
  tests: Test[];
  trigger_id?: string | null;
};

type CreateSuiteForTrigger = {
  branch?: string | null;
  commit_message?: string | null;
  commit_url?: string | null;
  environment_variables?: FormattedVariables | null;
  pull_request_url?: string | null;
  trigger: Trigger;
};

type FindSuitesForTeam = {
  limit: number;
  team_id: string;
};

type GitUrls = {
  commit_url?: string | null;
  pull_request_url?: string | null;
};

export const buildGitUrls = ({
  pull_request_id,
  repo_name,
  sha,
}: BuildGitUrls): GitUrls => {
  if (!repo_name) return {};

  const baseUrl = "https://github.com";

  return {
    commit_url: new URL(
      pull_request_id
        ? `${repo_name}/pull/${pull_request_id}/commits/${sha}`
        : `${repo_name}/commit/${sha}`,
      baseUrl
    ).href,
    pull_request_url: pull_request_id
      ? new URL(`${repo_name}/pull/${pull_request_id}`, baseUrl).href
      : null,
  };
};

export const buildTestsForFiles = (
  { files, tests }: BuildTestsForFiles,
  { logger }: ModelOptions
): Test[] => {
  const log = logger.prefix("buildTestsForFiles");

  return tests.map((t) => {
    const file = files.find((f) => f.path === t.path);

    if (!file) {
      log.alert("file not found for test", t.id);
      throw new ClientError(`no file for test ${t.path}`);
    }

    return { ...t, code: file.text };
  });
};

export const buildTestsForSuite = async (
  { branch, team_id, tests }: BuildTestsForSuite,
  options: ModelOptions
): Promise<BuildTestsForSuiteResult> => {
  const log = options.logger.prefix("buildTestsForSuite");
  log.debug("team", team_id);

  const team = await findTeam(team_id, options);

  if (!branch || !team.git_sync_integration_id) {
    log.debug(
      `skip, branch ${branch}, integration ${team.git_sync_integration_id}`
    );
    return { helpers: team.helpers, tests };
  }

  const { files } = await findFilesForBranch(
    { branch, integrationId: team.git_sync_integration_id },
    options
  );

  return {
    helpers: buildHelpersForFiles(files, options),
    tests: buildTestsForFiles({ files, tests }, options),
  };
};

export const createSuite = async (
  {
    branch,
    commit_message,
    commit_url,
    creator_id,
    environment_id,
    environment_variables,
    helpers,
    is_api,
    pull_request_url,
    tag_names,
    team_id,
    trigger_id,
  }: CreateSuite,
  { db, logger }: ModelOptions
): Promise<Suite> => {
  const log = logger.prefix("createSuite");
  log.debug("creator", creator_id, "trigger", trigger_id);

  const timestamp = minutesFromNow();

  const formattedVariables = environment_variables
    ? encrypt(JSON.stringify(environment_variables))
    : null;

  const suite = {
    branch: branch || null,
    commit_message: commit_message || null,
    commit_url: commit_url || null,
    created_at: timestamp,
    creator_id: creator_id || null,
    environment_id: environment_id || null,
    environment_variables: formattedVariables,
    helpers,
    id: cuid(),
    is_api: is_api || false,
    pull_request_url: pull_request_url || null,
    tag_names: tag_names || null,
    team_id,
    trigger_id,
    updated_at: timestamp,
  };

  await db("suites").insert(suite);

  log.debug("created suite", suite.id);

  return suite;
};

export const createSuiteForTrigger = async (
  {
    branch,
    commit_message,
    commit_url,
    environment_variables,
    pull_request_url,
    trigger,
  }: CreateSuiteForTrigger,
  { db, logger }: ModelOptions
): Promise<CreatedSuite | null> => {
  const log = logger.prefix("createSuiteForTrigger");
  log.debug("trigger", trigger.id);

  const tests = await findEnabledTestsForTrigger(trigger, { db, logger });

  if (tests.length) {
    const result = await createSuiteForTests(
      {
        branch,
        commit_message,
        commit_url,
        environment_variables,
        pull_request_url,
        team_id: trigger.team_id,
        trigger_id: trigger.id,
        tests,
      },
      { db, logger }
    );

    return result;
  } else {
    log.debug("skip creating suite, no enabled tests");
    return null;
  }
};

export const createSuiteForTests = async (
  {
    branch,
    commit_message,
    commit_url,
    creator_id,
    environment_id,
    environment_variables,
    is_api,
    pull_request_url,
    tag_names,
    team_id,
    tests,
    trigger_id,
  }: CreateSuiteForTests,
  { db, logger }: ModelOptions
): Promise<CreatedSuite> => {
  const log = logger.prefix("createSuiteForTests");

  log.debug(
    "test ids",
    tests.map((test) => test.id)
  );

  if (!environment_id && trigger_id) {
    const trigger = await findTrigger(trigger_id, { db, logger });
    environment_id = trigger.environment_id;
  }
  const { helpers, tests: testsForSuite } = await buildTestsForSuite(
    { branch, team_id, tests },
    { db, logger }
  );

  const suite = await createSuite(
    {
      branch,
      commit_message,
      commit_url,
      creator_id,
      environment_id,
      environment_variables,
      helpers,
      is_api,
      pull_request_url,
      tag_names,
      team_id,
      trigger_id,
    },
    { db, logger }
  );

  const runs = await createRunsForTests(
    {
      suite_id: suite.id,
      tests: testsForSuite,
    },
    { db, logger }
  );

  log.debug("created suite", suite.id);

  return { suite, runs };
};

export const findSuite = async (
  suite_id: string,
  { db, logger }: ModelOptions
): Promise<Suite> => {
  const log = logger.prefix("findSuite");

  const suite = await db
    .select("*")
    .from("suites")
    .where({ id: suite_id })
    .first();

  if (!suite) {
    log.debug("not found", suite_id);
    throw new ClientError("Suite not found");
  }

  return suite;
};

export const findSuitesForTeam = async (
  { limit, team_id }: FindSuitesForTeam,
  { db, logger }: ModelOptions
): Promise<SuiteResult[]> => {
  const log = logger.prefix("findSuitesForTeam");
  log.debug("team", team_id, "limit", limit);

  const suites = await db("suites")
    .select("suites.*" as "*")
    .select("environments.name AS environment_name")
    .leftJoin("environments", "suites.environment_id", "environments.id")
    .where({ "suites.team_id": team_id })
    .orderBy("created_at", "desc")
    .limit(limit);

  const triggers = await db("triggers").whereIn(
    "id",
    suites.map((s) => s.trigger_id)
  );

  log.debug(`found ${suites.length} suites`);

  return suites.map((s) => {
    const trigger = triggers.find((t) => t.id === s.trigger_id) || null;
    return { ...s, trigger };
  });
};
