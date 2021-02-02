import { minutesFromNow } from "../../shared/utils";
import { db } from "../db";
import environment from "../environment";
import { rankLocations } from "../services/location";
import { ModelOptions, Runner, Test } from "../types";
import { cuid } from "../utils";
import { findPendingRun, findRun, updateRun } from "./run";
import { findPendingTest, updateTest, updateTestToPending } from "./test";

type AssignRunner = {
  runner: Runner;
  run_id?: string;
  test_id?: string;
};

type FindClosestRunner = {
  locations: string[];
  runners: Runner[];
};

type FindRunner = {
  id?: string;
  include_deleted?: boolean;
  is_ready?: boolean;
  locations?: string[];
  run_id?: string;
  test_id?: string;
};

type FindRunners = {
  deployed_at?: null;
  ids?: string[];
  is_expired?: true;
};

type RequestRunnerForTest = {
  ip: string | null;
  test: Test;
};

export type UpdateRunner = {
  allow_skip?: boolean;
  api_key?: string | null;
  deployed_at?: string | null;
  deleted_at?: string;
  health_checked_at?: string;
  id: string;
  ready_at?: string | null;
  restarted_at?: string;
  run_id?: null;
  session_expires_at?: string | null;
  test_id?: null;
};

const ASSIGN_CONSTRAINTS = ["runners_run_id_unique", "runners_test_id_unique"];

export const assignRunner = async (
  { runner, ...assignTo }: AssignRunner,
  { logger, trx }: ModelOptions
): Promise<Runner | null> => {
  const log = logger.prefix("assignRunner");

  try {
    const result = await (trx || db).transaction(async (trx) => {
      const updates = { ...assignTo, session_expires_at: minutesFromNow(10) };

      const result = await trx("runners")
        .where({ id: runner.id, run_id: null, test_id: null })
        .update(updates);

      const didUpdate = result > 0;
      log.debug(runner.id, updates, didUpdate ? "updated" : "skipped");

      if (didUpdate && assignTo.test_id) {
        await updateTest(
          { id: assignTo.test_id, runner_requested_at: null },
          { logger, trx }
        );
      }

      return didUpdate ? { ...runner, ...updates } : null;
    });

    return result;
  } catch (error) {
    // its possible two updates happen concurrently so this one rolls back
    if (ASSIGN_CONSTRAINTS.find((c) => error.message.includes(c))) return null;

    throw error;
  }
};

export const countExcessRunners = async (
  location: string,
  { logger, trx }: ModelOptions
): Promise<number> => {
  const log = logger.prefix("countExcessRunners");

  const [result] = await (trx || db)("runners")
    .count("id")
    .where({ deleted_at: null, location, run_id: null, test_id: null })
    .whereNotNull("ready_at");

  const available = parseInt(result.count as string, 10);
  const reserved = environment.RUNNER_LOCATIONS[location]?.reserved || 0;
  const excess = available - reserved;

  log.debug(
    `${location} available ${available} reserved ${reserved} excess ${excess}`
  );

  return excess;
};

export const createRunners = async (
  locations: string[],
  { logger, trx }: ModelOptions
): Promise<Runner[]> => {
  if (locations.length <= 0) return;

  const log = logger.prefix("createRunners");
  log.debug(locations.length);

  const timestamp = minutesFromNow();

  const runners: Runner[] = locations.map((location) => ({
    created_at: timestamp,
    id: cuid(),
    location,
    updated_at: timestamp,
  }));

  await (trx || db)("runners").insert(runners);

  log.debug(
    "created",
    runners.map((s) => s.id)
  );

  return runners;
};

export const expireRunner = async (
  find: FindRunner,
  options: ModelOptions
): Promise<void> => {
  const runner = await findRunner(find, options);
  if (!runner) return;

  await updateRunner(
    { id: runner.id, session_expires_at: minutesFromNow() },
    options
  );
};

/**
 * @summary Delete workers that have been created for 5 minutes but not reported a health check
 *   and workers that have not reported a health check for 2 minutes.
 **/
export const deleteUnhealthyRunners = async ({
  logger,
  trx,
}: ModelOptions): Promise<void> => {
  const log = logger.prefix("deleteUnhealthyRunners");

  const rows = await (trx || db)("runners")
    .select("id")
    .where(function () {
      this.where({ health_checked_at: null, deleted_at: null }).andWhere(
        "created_at",
        "<=",
        minutesFromNow(-5)
      );
    })
    .orWhere(function () {
      this.where({ deleted_at: null }).andWhere(
        "health_checked_at",
        "<=",
        minutesFromNow(-2)
      );
    });

  const ids = rows.map((r) => r.id);

  log.debug("delete unhealthy runners", ids.join(","));

  await Promise.all(
    ids.map((id) =>
      updateRunner(
        { allow_skip: true, id, deleted_at: minutesFromNow() },
        { logger, trx }
      )
    )
  );

  log.debug("deleted", ids.length, ids);
};

export const findPendingTestOrRunId = async (
  location: string,
  options: ModelOptions
): Promise<{ run_id?: string; test_id?: string } | null> => {
  const pendingTest = await findPendingTest(location, options);
  if (pendingTest) return { test_id: pendingTest.id };

  // lock run location (for now)
  if (location !== "eastus2") return null;

  const excessRunners = await countExcessRunners(location, options);
  if (excessRunners > 0) {
    // if there are excess runners, find a run
    const pendingRun = await findPendingRun({ needs_runner: true }, options);
    if (pendingRun) return { run_id: pendingRun.id };
  }

  return null;
};

const findClosestRunner = ({
  locations,
  runners,
}: FindClosestRunner): Runner | null => {
  for (const location of locations) {
    const runner = runners.find((r) => r.location === location);
    if (runner) return runner;
  }

  // return first runner if none found for given locations
  return runners[0] || null;
};

export const findRunner = async (
  { id, include_deleted, is_ready, locations, run_id, test_id }: FindRunner,
  { trx }: ModelOptions
): Promise<Runner | null> => {
  const filter: Record<string, unknown> = {};

  if (!include_deleted) filter.deleted_at = null;

  if (id) filter.id = id;

  let query = (trx || db)("runners").select("*").from("runners");

  if (run_id && test_id) {
    // allow either
    query = query
      .where(function () {
        this.where({ run_id }).orWhere({ test_id });
      })
      // prefer the run's runner
      .orderBy("run_id", "asc");
  } else {
    if (run_id !== undefined) filter.run_id = run_id;
    if (test_id !== undefined) filter.test_id = test_id;
  }

  query = query.where(filter);

  if (is_ready) query = query.whereNotNull("ready_at");

  if (locations?.length) {
    query = query.whereIn("location", locations);
    const runners = await query;
    return findClosestRunner({ locations, runners });
  }

  const runner = await query.first();
  return runner || null;
};

export const findRunners = async (
  options: FindRunners,
  { trx }: ModelOptions
): Promise<Runner[]> => {
  let query = (trx || db)("runners")
    .select("*")
    .from("runners")
    .where({ deleted_at: null });

  if (options.ids !== undefined) {
    query = query.whereIn("id", options.ids);
  }

  if (options.deployed_at !== undefined) {
    query = query.where({ deployed_at: options.deployed_at });
  }

  if (options.is_expired) {
    query = query.where("session_expires_at", "<=", minutesFromNow());
  }

  const runners = await query;

  return runners;
};

export const requestRunnerForTest = async (
  { test, ip }: RequestRunnerForTest,
  options: ModelOptions
): Promise<Runner | null> => {
  const locations = await rankLocations({ ip, logger: options.logger });

  const runner = await findRunner(
    { locations, is_ready: true, run_id: null, test_id: null },
    options
  );

  if (runner) {
    const assignedRunner = await assignRunner(
      { runner, test_id: test.id },
      options
    );
    if (assignedRunner) return assignedRunner;
  }

  if (!test.runner_requested_at) {
    await updateTestToPending(
      { id: test.id, runner_locations: locations },
      options
    );
  }

  return null;
};

export const updateRunner = async (
  { allow_skip, id, ...options }: UpdateRunner,
  { logger, trx }: ModelOptions
): Promise<Runner> => {
  const log = logger.prefix("updateRunner");

  return (trx || db).transaction(async (trx) => {
    const runner = await findRunner({ id }, { logger, trx });
    if (!runner) {
      if (allow_skip) return;
      throw new Error(`runner not found ${id}`);
    }

    const updates: Partial<Runner> = {
      ...options,
      updated_at: minutesFromNow(),
    };

    if (updates.deleted_at) {
      updates.run_id = null;
      updates.test_id = null;
    }

    if (updates.run_id === null && runner.run_id) {
      const run = await findRun(runner.run_id, { logger, trx });
      if (run.status === "created" && run.started_at) {
        // mark it as failed since it is not finished
        logger.alert("run expired", run.id);
        await updateRun({ id: run.id, status: "fail" }, { logger, trx });
      }
    }

    await trx("runners").where({ id }).update(updates);
    log.debug("updated", id, updates);

    return { ...runner, ...updates };
  });
};
