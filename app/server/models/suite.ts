import { minutesFromNow } from "../../shared/utils";
import { ClientError } from "../errors";
import {
  FormattedVariables,
  ModelOptions,
  Run,
  Suite,
  SuiteResult,
  Test,
} from "../types";
import { cuid } from "../utils";
import { encrypt } from "./encrypt";
import { createRunsForTests } from "./run";
import { findEnabledTestsForTrigger } from "./test";
import { findTrigger } from "./trigger";

export type SuiteForTeam = Suite & {
  github_login: string | null;
  name: string;
  repeat_minutes: number | null;
};

type CreateSuite = {
  creator_id?: string;
  environment_id?: string | null;
  environment_variables?: FormattedVariables;
  team_id: string;
  trigger_id: string;
};

type CreateSuiteForTests = {
  creator_id?: string;
  environment_id?: string | null;
  environment_variables?: FormattedVariables;
  team_id: string;
  tests: Test[];
  trigger_id?: string | null;
};

type CreateSuiteForTrigger = {
  environment_variables?: FormattedVariables;
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

type UpdateSuite = {
  alert_sent_at?: string;
  id: string;
};

export const createSuite = async (
  {
    creator_id,
    environment_id,
    environment_variables,
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
    created_at: timestamp,
    creator_id: creator_id || null,
    environment_id: environment_id || null,
    environment_variables: formattedVariables,
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

  const suite = await createSuite(
    {
      creator_id,
      environment_id,
      environment_variables,
      team_id,
      trigger_id,
    },
    { db, logger }
  );

  const runs = await createRunsForTests(
    {
      suite_id: suite.id,
      tests,
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

export const updateSuite = async (
  { alert_sent_at, id }: UpdateSuite,
  { db, logger }: ModelOptions
): Promise<Suite> => {
  const log = logger.prefix("updateSuite");

  const existingSuite = await findSuite(id, { db, logger });
  if (!existingSuite) throw new Error("Suite not found");

  const updates: Partial<Suite> = { updated_at: minutesFromNow() };

  if (alert_sent_at !== undefined) updates.alert_sent_at = alert_sent_at;

  await db("suites").where({ id }).update(updates);

  log.debug("updated", id, updates);

  return { ...existingSuite, ...updates };
};
