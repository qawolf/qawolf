import { minutesFromNow } from "../../shared/utils";
import { db } from "../db";
import { sendAlert } from "../services/alert/send";
import {
  createStorageReadAccessUrl,
  getArtifactsOptions,
} from "../services/aws/storage";
import { updateCommitStatus } from "../services/gitHub/app";
import {
  ModelOptions,
  Run,
  RunnerRun,
  RunResult,
  RunStatus,
  SuiteRun,
  Test,
} from "../types";
import { cuid } from "../utils";
import { decrypt } from "./encrypt";
import { buildEnvironmentVariables } from "./environment_variable";

type CreateRunsForTests = {
  suite_id: string;
  tests: Test[];
};

type FindLatestRuns = {
  group_id: string;
  test_id: string;
};

export type UpdateRun = {
  code?: string;
  current_line?: number;
  id: string;
  started_at?: string;
  status?: RunStatus;
};

export const countPendingRuns = async ({
  logger,
  trx,
}: ModelOptions): Promise<number> => {
  const log = logger.prefix("countPendingRuns");

  const result = await (trx || db)("runs")
    .count("*", { as: "count" })
    .from("runs")
    .leftJoin("runners", "runners.run_id", "runs.id")
    .where({ "runners.id": null, started_at: null })
    .first();

  log.debug(result);

  return Number(result.count);
};

export const createRunsForTests = async (
  { suite_id, tests }: CreateRunsForTests,
  { logger, trx }: ModelOptions
): Promise<Run[]> => {
  const log = logger.prefix("createRunsForTests");

  log.debug("suite", suite_id);

  const created_at = minutesFromNow();

  const runs = tests.map(({ code, id: test_id }) => ({
    code,
    created_at,
    current_line: null,
    id: cuid(),
    status: "created" as RunStatus,
    suite_id,
    test_id,
  }));
  await (trx || db)("runs").insert(runs);

  log.debug(
    "created",
    runs.map((r) => r.id)
  );

  return runs;
};

export const findLatestRuns = async (
  { group_id, test_id }: FindLatestRuns,
  { logger, trx }: ModelOptions
): Promise<SuiteRun[]> => {
  const log = logger.prefix("findLatestRuns");

  log.debug("group", group_id, "test", test_id);

  const runs = await (trx || db)
    .select("runs.*" as "*")
    .select("tests.name AS test_name")
    .select("tests.deleted_at AS test_deleted_at")
    .from("runs")
    .innerJoin("suites", "runs.suite_id", "suites.id")
    .innerJoin("tests", "runs.test_id", "tests.id")
    .where({ group_id, test_id })
    .orderBy("created_at", "desc")
    .limit(10);

  log.debug(`found ${runs.length} runs`);

  return runs.map((run: Run & { test_deleted_at: string | null }) => {
    const gif_url = run.completed_at
      ? createStorageReadAccessUrl(`${run.id}.gif`)
      : null;

    return { ...run, gif_url, is_test_deleted: !!run.test_deleted_at };
  });
};

export const findPendingRun = async (
  { needs_runner }: { needs_runner?: true },
  { trx }: ModelOptions
): Promise<Pick<Run, "created_at" | "id"> | null> => {
  let query = (trx || db)
    .select("runs.id" as "*")
    .select("runs.created_at" as "*")
    .from("runs")
    .where({ completed_at: null });

  if (needs_runner) {
    query = query
      .leftJoin("runners", "runners.run_id", "runs.id")
      .where({ "runners.id": null, started_at: null });
  }

  const result = await query.orderBy("runs.created_at", "asc").first();

  return result || null;
};

export const findRun = async (
  id: string,
  { trx }: ModelOptions
): Promise<Run> => {
  const run = await (trx || db).select("*").from("runs").where({ id }).first();
  if (!run) throw new Error("run not found " + id);
  return run;
};

export const findRunResult = async (
  id: string,
  { logger, trx }: ModelOptions
): Promise<RunResult> => {
  const run = await findRun(id, { logger, trx });

  let logs_url: string | null = null;
  let video_url: string | null = null;

  if (run.completed_at) {
    logs_url = createStorageReadAccessUrl(`${run.id}.txt`);
    video_url = createStorageReadAccessUrl(`${run.id}.mp4`);
  }

  return { ...run, logs_url, video_url };
};

export const findRunsForSuite = async (
  suite_id: string,
  { trx }: ModelOptions
): Promise<SuiteRun[]> => {
  const runs = await (trx || db)
    .select("runs.*" as "*")
    .select("tests.deleted_at AS test_deleted_at")
    .select("tests.name AS test_name")
    .from("runs")
    .innerJoin("tests", "runs.test_id", "tests.id")
    .where({ "runs.suite_id": suite_id })
    .orderBy("test_name", "asc");

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  return runs.map((run: any) => {
    const gif_url = run.completed_at
      ? createStorageReadAccessUrl(`${run.id}.gif`)
      : null;

    return {
      ...run,
      gif_url,
      is_test_deleted: !!run.test_deleted_at,
    };
  });
};

export const findSuiteRunForRunner = async (
  run_id: string,
  { logger, trx }: ModelOptions
): Promise<RunnerRun | null> => {
  return (trx || db).transaction(async (trx) => {
    const row = await trx
      .select("runs.*")
      .select("groups.environment_id AS environment_id")
      .select("suites.environment_variables AS environment_variables")
      .select("suites.team_id AS team_id")
      .select("teams.helpers AS helpers")
      .select("tests.version AS test_version")
      .from("runs")
      .innerJoin("suites", "runs.suite_id", "suites.id")
      .innerJoin("groups", "groups.id", "suites.group_id")
      .innerJoin("teams", "suites.team_id", "teams.id")
      .innerJoin("tests", "runs.test_id", "tests.id")
      .andWhere({ "runs.id": run_id })
      .first();

    if (!row) return null;

    const custom_variables = row.environment_variables
      ? JSON.parse(decrypt(row.environment_variables))
      : {};
    const { env } = await buildEnvironmentVariables(
      { custom_variables, environment_id: row.environment_id },
      { logger, trx }
    );

    return {
      artifacts: await getArtifactsOptions({ name: row.id }),
      code: row.code,
      env,
      helpers: row.helpers,
      id: row.id,
      test_id: row.test_id,
      version: row.test_version,
    };
  });
};

export const findTestHistory = async (
  test_id: string,
  { logger, trx }: ModelOptions
): Promise<Run[]> => {
  const log = logger.prefix("findRunHistory");
  log.debug("test", test_id);

  const runs = await (trx || db)
    .select("runs.*" as "*")
    .from("runs")
    .where({ test_id })
    .orderBy("created_at", "desc")
    .limit(8);

  log.debug(`found ${runs.length} runs`);

  return runs;
};

export const updateRun = async (
  { id, ...options }: UpdateRun,
  { logger, trx }: ModelOptions
): Promise<Run> => {
  const log = logger.prefix("updateRun");

  const timestamp = minutesFromNow();

  const updates: Partial<Run> = {
    ...options,
    updated_at: timestamp,
  };

  if (options.status === "fail" || options.status === "pass") {
    updates.completed_at = timestamp;
  }

  const run = await findRun(id, { logger, trx });
  await (trx || db)("runs").where({ id }).update(updates);

  if (updates.completed_at && run.suite_id) {
    await Promise.all([
      sendAlert({ logger, suite_id: run.suite_id }),
      updateCommitStatus({ logger, suite_id: run.suite_id }),
    ]);
  }

  log.debug("updated", id, updates);

  return { ...run, ...updates };
};
