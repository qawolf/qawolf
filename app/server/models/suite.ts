import { minutesFromNow } from "../../shared/utils";
import { ClientError } from "../errors";
import {
  buildHelpersForFiles,
  findFilesForBranch,
} from "../services/gitHub/tree";
import {
  FormattedVariables,
  GitHubFile,
  ModelOptions,
  Run,
  Suite,
  SuiteResult,
  Test,
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
  creator_id?: string;
  environment_id?: string | null;
  environment_variables?: FormattedVariables | null;
  helpers: string;
  team_id: string;
  trigger_id: string;
};

type CreateSuiteForTests = {
  branch?: string | null;
  creator_id?: string;
  environment_id?: string | null;
  environment_variables?: FormattedVariables | null;
  team_id: string;
  tests: Test[];
  trigger_id?: string | null;
};

type CreateSuiteForTrigger = {
  environment_variables?: FormattedVariables | null;
  team_id: string;
  trigger_id: string;
};

type CreatedSuite = {
  runs: Run[];
  suite: Suite;
};

type FindSuitesForTeam = {
  limit: number;
  team_id: string;
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
    creator_id,
    environment_id,
    environment_variables,
    helpers,
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
    created_at: timestamp,
    creator_id: creator_id || null,
    environment_id: environment_id || null,
    environment_variables: formattedVariables,
    helpers,
    id: cuid(),
    team_id,
    trigger_id,
    updated_at: timestamp,
  };

  await db("suites").insert(suite);

  log.debug("created suite", suite.id);

  return suite;
};

export const createSuiteForTrigger = async (
  { environment_variables, team_id, trigger_id }: CreateSuiteForTrigger,
  { db, logger }: ModelOptions
): Promise<CreatedSuite | null> => {
  const log = logger.prefix("createSuiteForTrigger");
  log.debug("trigger", trigger_id, "team", team_id);

  const tests = await findEnabledTestsForTrigger(
    { trigger_id },
    { db, logger }
  );

  if (tests.length) {
    const result = await createSuiteForTests(
      { environment_variables, team_id, trigger_id, tests },
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
    creator_id,
    environment_id,
    environment_variables,
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
      creator_id,
      environment_id,
      environment_variables,
      helpers,
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
