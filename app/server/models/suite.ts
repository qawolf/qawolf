import { db } from "../db";
import { Logger } from "../Logger";
import { FormattedVariables, ModelOptions, Run, Suite, Test } from "../types";
import { cuid, minutesFromNow } from "../utils";
import { encrypt } from "./encrypt";
import { createRunsForTests } from "./run";

export type SuiteForTeam = Suite & {
  github_login: string | null;
  name: string;
  repeat_minutes: number | null;
};

type CreateSuite = {
  creator_id?: string;
  environment_variables?: FormattedVariables;
  group_id: string;
  team_id: string;
};

type CreateSuiteForTests = {
  creator_id?: string;
  environment_variables?: FormattedVariables;
  group_id: string;
  team_id: string;
  tests: Test[];
};

type FindSuitesForGroup = {
  group_id: string;
  limit: number;
};

type UpdateSuite = {
  alert_sent_at?: string;
  id: string;
};

export const createSuite = async (
  { creator_id, environment_variables, group_id, team_id }: CreateSuite,
  { logger, trx }: ModelOptions
): Promise<Suite> => {
  const log = logger.prefix("createSuite");
  log.debug("creator", creator_id, "group", group_id);

  const timestamp = minutesFromNow();

  const formattedVariables = environment_variables
    ? encrypt(JSON.stringify(environment_variables))
    : null;

  const suite = {
    created_at: timestamp,
    creator_id: creator_id || null,
    environment_variables: formattedVariables,
    group_id,
    id: cuid(),
    team_id,
    updated_at: timestamp,
  };

  await (trx || db)("suites").insert(suite);

  log.debug("created suite", suite.id);

  return suite;
};

export const createSuiteForTests = async (
  {
    creator_id,
    environment_variables,
    group_id,
    team_id,
    tests,
  }: CreateSuiteForTests,
  { logger, trx }: ModelOptions
): Promise<{ runs: Run[]; suite: Suite }> => {
  const log = logger.prefix("createSuiteForTests");

  log.debug(
    "test ids",
    tests.map((test) => test.id)
  );

  const suite = await createSuite(
    { creator_id, environment_variables, group_id, team_id },
    { logger, trx }
  );

  const runs = await createRunsForTests(
    {
      suite_id: suite.id,
      tests,
    },
    { logger, trx }
  );

  log.debug("created suite", suite.id);

  return { suite, runs };
};

export const findSuite = async (
  suite_id: string,
  { logger, trx }: ModelOptions
): Promise<Suite> => {
  const log = logger.prefix("findSuite");

  const suite = await (trx || db)
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

export const findSuitesForGroup = async (
  { group_id, limit }: FindSuitesForGroup,
  logger: Logger
): Promise<Suite[]> => {
  const log = logger.prefix("findSuitesForGroup");

  log.debug("group", group_id);

  const suites = await db
    .select("*")
    .from("suites")
    .where({ group_id })
    .orderBy("created_at", "desc")
    .limit(limit);

  log.debug(`found ${suites.length} suites for group ${group_id}`);

  return suites;
};

export const updateSuite = async (
  { alert_sent_at, id }: UpdateSuite,
  { logger, trx }: ModelOptions
): Promise<Suite> => {
  const log = logger.prefix("updateSuite");

  const existingSuite = await findSuite(id, { logger, trx });
  if (!existingSuite) throw new Error("Suite not found");

  const updates: Partial<Suite> = { updated_at: minutesFromNow() };

  if (alert_sent_at !== undefined) updates.alert_sent_at = alert_sent_at;

  await (trx || db)("suites").where({ id }).update(updates);

  log.debug("updated", id, updates);

  return { ...existingSuite, ...updates };
};
