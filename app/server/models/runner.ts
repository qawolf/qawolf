import { minutesFromNow } from "../../shared/utils";
import environment from "../environment";
import { rankLocations } from "../services/location";
import { ModelOptions, Runner, Test } from "../types";
import { cuid } from "../utils";
import { findPendingRun, findRun, UpdateRun, updateRun } from "./run";
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

type ResetRunner = {
  id?: string;
  run_id?: string;
  type: "delete_unassigned" | "delete_unhealthy" | "expire" | "restart";
};

export type UpdateRunner = {
  api_key?: string;
  deployed_at?: string;
  health_checked_at?: string;
  id: string;
  ready_at?: string;
  session_expires_at?: string;
};

const ASSIGN_CONSTRAINTS = ["runners_run_id_unique", "runners_test_id_unique"];

export const assignRunner = async (
  { runner, ...assignTo }: AssignRunner,
  { db, logger }: ModelOptions
): Promise<Runner | null> => {
  const log = logger.prefix("assignRunner");

  try {
    const result = await db.transaction(async (trx) => {
      const updates = { ...assignTo, session_expires_at: minutesFromNow(10) };

      const result = await trx("runners")
        .where({
          id: runner.id,
          run_id: null,
          // exclude recently expired runners
          session_expires_at: null,
          test_id: null,
        })
        .update(updates);

      const didUpdate = result > 0;
      log.debug(runner.id, updates, didUpdate ? "updated" : "skipped");

      if (didUpdate && assignTo.test_id) {
        await updateTest(
          { id: assignTo.test_id, runner_requested_at: null },
          { db: trx, logger }
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
  { db, logger }: ModelOptions
): Promise<number> => {
  const log = logger.prefix("countExcessRunners");

  const [result] = await db("runners")
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
  { db, logger }: ModelOptions
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

  await db("runners").insert(runners);

  log.debug(
    "created",
    runners.map((s) => s.id)
  );

  return runners;
};

export const resetRunner = async (
  { id, run_id, type }: ResetRunner,
  { db, logger }: ModelOptions
): Promise<void> => {
  const log = logger.prefix("resetRunner");

  const runner = await findRunner({ id, run_id }, { db, logger });
  if (!runner) {
    log.debug("skip: runner not found (deleted)", { id, run_id, type });
    return;
  }

  const run = await findRun(runner.run_id, { db, logger });
  log.debug({ id: runner.id, run_id: run?.id });

  if (run && type === "delete_unassigned") {
    log.debug(`skip: runner ${runner.id} assigned to run ${run.id}`);
    return;
  }

  return db.transaction(async (trx) => {
    if (run?.status === "created" && run.started_at) {
      // deal with the assigned but incomplete run
      const runUpdates: UpdateRun = { id: run.id };

      if (type === "delete_unhealthy" && !run.retries) {
        // an unhealthy runner could be our fault so retry it once
        // retry once only, since it could be a malicious user
        runUpdates.retry_error = "unhealthy_runner";
      } else {
        // for every other case expire the run
        log.alert("fail expired run", run.id);
        runUpdates.error = "expired";
        runUpdates.status = "fail";
      }

      await updateRun(runUpdates, { db: trx, logger });
    }

    const now = minutesFromNow();

    const updates: Partial<Runner> = {
      api_key: null,
      id: runner.id,
      ready_at: null,
      run_id: null,
      session_expires_at: null,
      test_id: null,
    };

    if (type === "delete_unassigned" || type === "delete_unhealthy") {
      updates.deleted_at = now;
    } else if (type === "expire") {
      updates.session_expires_at = now;
    } else if (type === "restart") {
      // reset the delete timer
      updates.health_checked_at = now;
      updates.restarted_at = now;
    }

    const where: Partial<Runner> = { id };
    if (type == "delete_unassigned") {
      where.run_id = null;
      where.test_id = null;
    }

    const count = await trx("runners").where(where).update(updates);
    log.debug(count ? "updated" : "did not update", id, updates);
  });
};

/**
 * @summary Delete workers that have been created for 5 minutes but not reported a health check
 *   and workers that have not reported a health check for 2 minutes.
 **/
export const deleteUnhealthyRunners = async ({
  db,
  logger,
}: ModelOptions): Promise<void> => {
  const log = logger.prefix("deleteUnhealthyRunners");

  const rows = await db("runners")
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

  if (!ids.length) {
    log.debug("skip: no unhealthy runners");
    return;
  }

  log.alert("delete unhealthy runners", ids.join(","));

  await Promise.all(
    ids.map((id) =>
      resetRunner({ id, type: "delete_unhealthy" }, { db, logger })
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
  { db }: ModelOptions
): Promise<Runner | null> => {
  const filter: Record<string, unknown> = {};

  if (!include_deleted) filter.deleted_at = null;

  if (id) filter.id = id;

  let query = db("runners").select("*").from("runners");

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
  { db }: ModelOptions
): Promise<Runner[]> => {
  let query = db("runners")
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
  { id, ...options }: UpdateRunner,
  { db, logger }: ModelOptions
): Promise<Runner> => {
  const log = logger.prefix("updateRunner");

  return db.transaction(async (trx) => {
    const runner = await findRunner({ id }, { db: trx, logger });
    if (!runner) throw new Error(`runner not found ${id}`);

    const updates: Partial<Runner> = {
      ...options,
      updated_at: minutesFromNow(),
    };

    const count = await trx("runners").where({ id }).update(updates);
    if (!count) throw new Error("runner not updated");

    log.debug("updated", id, updates);
    return { ...runner, ...updates };
  });
};
