import { minutesFromNow } from "../../shared/utils";
import { FormattedVariables, ModelOptions, Run, Suite, Test } from "../types";
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

type FindSuitesForTrigger = {
  limit: number;
  trigger_id: string;
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
    throw new Error("Suite not found");
  }

  return suite;
};

export const findSuitesForTrigger = async (
  { limit, trigger_id }: FindSuitesForTrigger,
  { db, logger }: ModelOptions
): Promise<Suite[]> => {
  const log = logger.prefix("findSuitesForTrigger");

  log.debug("trigger", trigger_id);

  const suites = await db
    .select("*")
    .from("suites")
    .where({ trigger_id })
    .orderBy("created_at", "desc")
    .limit(limit);

  log.debug(`found ${suites.length} suites for trigger ${trigger_id}`);

  return suites;
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
