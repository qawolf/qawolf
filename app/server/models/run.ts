import { minutesFromNow } from "../../shared/utils";
import { sendAlert } from "../services/alert/send";
import {
  createStorageReadAccessUrl,
  getArtifactsOptions,
} from "../services/aws/storage";
import { updateCommitStatus } from "../services/gitHub/app";
import { trackSegmentEvent } from "../services/segment";
import {
  ModelOptions,
  Run,
  RunnerRun,
  RunResult,
  RunStatus,
  RunWithGif,
  StatusCounts,
  SuiteRun,
  Team,
  Test,
} from "../types";
import { cuid } from "../utils";
import { decrypt } from "./encrypt";
import { findEnvironmentIdForRun } from "./environment";
import { buildEnvironmentVariables } from "./environment_variable";
import { findTest } from "./test";

type CreateRunsForTests = {
  suite_id: string;
  tests: Test[];
};

type FindLatestRuns = {
  test_id: string;
  trigger_id: string | null;
};

export type UpdateRun = {
  code?: string;
  current_line?: number;
  error?: string;
  id: string;
  retry_error?: string;
  started_at?: string;
  status?: RunStatus;
};

const formatCountForStatus = (
  counts: { count: string; status: RunStatus }[],
  status: RunStatus
): number => {
  const count = counts.find((c) => c.status === status);
  if (count) return Number(count.count);

  return 0;
};

export const countIncompleteRuns = async ({
  db,
  logger,
}: ModelOptions): Promise<number> => {
  const log = logger.prefix("countIncompleteRuns");

  const result = await db("runs")
    .count("*", { as: "count" })
    .from("runs")
    .where({ completed_at: null })
    .first();

  log.debug(result);

  return Number(result.count);
};

export const countRunsForTeam = async (
  { id, renewed_at }: Team,
  { db, logger }: ModelOptions
): Promise<number> => {
  const log = logger.prefix("countRunsForTeam");
  log.debug("team", id, "renewed_at", renewed_at);

  const result = await db("runs")
    .count("runs.*", { as: "count" })
    .innerJoin("tests", "runs.test_id", "tests.id")
    .where({ "tests.team_id": id })
    .andWhere("runs.created_at", ">", renewed_at)
    .first();

  log.debug("count", result.count);

  return Number(result.count);
};

export const createRunsForTests = async (
  { suite_id, tests }: CreateRunsForTests,
  { db, logger }: ModelOptions
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
  await db("runs").insert(runs);

  log.debug(
    "created",
    runs.map((r) => r.id)
  );

  return runs;
};

export const findLatestRuns = async (
  { test_id, trigger_id }: FindLatestRuns,
  { db, logger }: ModelOptions
): Promise<RunWithGif[]> => {
  const log = logger.prefix("findLatestRuns");

  log.debug("test", test_id, "trigger", trigger_id);

  const query = db("runs")
    .select("runs.*" as "*")
    .where({ test_id })
    .innerJoin("suites", "runs.suite_id", "suites.id");

  if (trigger_id) query.andWhere({ trigger_id });

  const runs = await query.orderBy("created_at", "desc").limit(5);

  log.debug(`found ${runs.length} runs`);

  return runs.map((run: Run) => {
    const gif_url = run.completed_at
      ? createStorageReadAccessUrl(`${run.id}.gif`)
      : null;

    return { ...run, gif_url };
  });
};

export const findPendingRun = async (
  { needs_runner }: { needs_runner?: true },
  { db }: ModelOptions
): Promise<Pick<Run, "created_at" | "id"> | null> => {
  let query = db
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
  { db }: ModelOptions
): Promise<Run | null> => {
  const run = await db.select("*").from("runs").where({ id }).first();
  return run || null;
};

export const findRunResult = async (
  id: string,
  { db, logger }: ModelOptions
): Promise<RunResult> => {
  const run = await findRun(id, { db, logger });
  if (!run) throw new Error("run not found");

  const environment_id = await findEnvironmentIdForRun(id, { db, logger });

  let logs_url: string | null = null;
  let video_url: string | null = null;

  if (run.completed_at) {
    logs_url = createStorageReadAccessUrl(`${run.id}.txt`);
    video_url = createStorageReadAccessUrl(`${run.id}.mp4`);
  }

  return { ...run, environment_id, logs_url, video_url };
};

export const findRunsForSuite = async (
  suite_id: string,
  { db }: ModelOptions
): Promise<SuiteRun[]> => {
  const runs = await db
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

export const findStatusCountsForSuite = async (
  suite_id: string,
  { db, logger }: ModelOptions
): Promise<StatusCounts> => {
  const log = logger.prefix("findStatusCountsForSuite");
  log.debug("suite", suite_id);

  const counts = await db("runs")
    .select("status")
    .count("status")
    .where({ suite_id })
    .groupBy("status");

  return {
    created: formatCountForStatus(counts, "created"),
    fail: formatCountForStatus(counts, "fail"),
    pass: formatCountForStatus(counts, "pass"),
  };
};

export const findSuiteRunForRunner = async (
  run_id: string,
  { db, logger }: ModelOptions
): Promise<RunnerRun | null> => {
  return db.transaction(async (trx) => {
    const row = await trx
      .select("runs.*")
      .select("suites.environment_id AS environment_id")
      .select("suites.environment_variables AS environment_variables")
      .select("suites.team_id AS team_id")
      .select("teams.helpers AS helpers")
      .select("teams.api_key AS api_key")
      .select("teams.inbox AS inbox")
      .select("tests.version AS test_version")
      .from("runs")
      .innerJoin("suites", "runs.suite_id", "suites.id")
      .innerJoin("teams", "suites.team_id", "teams.id")
      .innerJoin("tests", "runs.test_id", "tests.id")
      .andWhere({ "runs.id": run_id })
      .first();

    if (!row) return null;

    const custom_variables = row.environment_variables
      ? JSON.parse(decrypt(row.environment_variables))
      : {};

    const { env } = await buildEnvironmentVariables(
      {
        custom_variables: {
          ...custom_variables,
          QAWOLF_TEAM_API_KEY: decrypt(row.api_key),
          QAWOLF_TEAM_INBOX: row.inbox,
        },
        environment_id: row.environment_id,
      },
      { db, logger }
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
  { db, logger }: ModelOptions
): Promise<Run[]> => {
  const log = logger.prefix("findRunHistory");
  log.debug("test", test_id);

  const runs = await db
    .select("runs.*" as "*")
    .from("runs")
    .where({ test_id })
    .orderBy("created_at", "desc")
    .limit(8);

  log.debug(`found ${runs.length} runs`);

  return runs;
};

export const updateRun = async (
  { id, error, retry_error, ...options }: UpdateRun,
  { db, logger }: ModelOptions
): Promise<Run> => {
  const log = logger.prefix("updateRun");

  const timestamp = minutesFromNow();

  const updates: Partial<Run> = {
    ...options,
    updated_at: timestamp,
  };

  const run = await findRun(id, { db, logger });
  if (!run) throw new Error("run not found");

  if (retry_error) {
    log.alert("retry error", retry_error.substring(0, 250));
    updates.completed_at = null;
    updates.error = retry_error.substring(0, 100);
    updates.retries = (run.retries || 0) + 1;
    updates.started_at = null;
    updates.status = "created";
  } else if (error !== undefined) {
    updates.error = error ? error.substring(0, 100) : null;
  }

  if (["fail", "pass"].includes(updates.status)) {
    updates.completed_at = timestamp;

    // ensure started_at is set, so the run is no longer pending
    // this could happen if the run started request never made it through
    if (!run.started_at) updates.started_at = timestamp;

    const test = await findTest(run.test_id, { db, logger });
    trackSegmentEvent({
      event: "Run Completed",
      properties: {
        run_id: run.id,
        status: updates.status,
      },
      user: { id: test.creator_id },
    });
  }

  await db("runs").where({ id }).update(updates);

  if (updates.completed_at && run.suite_id) {
    await Promise.all([
      sendAlert(run.suite_id, { db, logger }),
      updateCommitStatus(run.suite_id, { db, logger }),
    ]);
  }

  log.debug("updated", id, updates);

  return { ...run, ...updates };
};
