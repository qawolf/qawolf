import { minutesFromNow } from "../../shared/utils";
import { Job, JobName, ModelOptions } from "../types";
import { cuid } from "../utils";
import { findRunsForSuite } from "./run";

type CreateJob = {
  name: JobName;
  suite_id: string;
};

type UpdateJob = {
  completed_at: string;
  id: string;
};

export const claimPendingJob = async ({
  db,
  logger,
}: ModelOptions): Promise<Job | null> => {
  const log = logger.prefix("claimPendingJob");

  const subquery = db("jobs")
    .select("id")
    .whereNull("started_at")
    .orderBy("created_at", "asc")
    .limit(1);

  const jobs = await db("jobs")
    .whereIn("id", subquery)
    .update({ started_at: minutesFromNow() }, "*");

  const job = jobs[0] || null;
  log.debug(job ? `claimed job ${job.id}` : "no pending jobs");

  return job;
};

export const countPendingJobs = async ({
  db,
  logger,
}: ModelOptions): Promise<number> => {
  const log = logger.prefix("countPendingJobs");

  const rows = await db("jobs")
    .whereNull("started_at")
    .count("id", { as: "count" });

  const count = Number(rows[0].count);
  log.debug(`${count} pending jobs`);

  return count;
};

export const createJob = async (
  { name, suite_id }: CreateJob,
  { db, logger }: ModelOptions
): Promise<Job> => {
  const log = logger.prefix("createJob");
  log.debug("job name", name, "for suite", suite_id);

  const job = {
    completed_at: null,
    id: cuid(),
    name,
    started_at: null,
    suite_id,
  };

  await db.raw(
    `INSERT INTO jobs (completed_at, id, name, started_at, suite_id)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT DO NOTHING`,
    Object.values(job)
  );
  log.debug("created", job.id);

  return job;
};

export const createJobsForSuite = async (
  suite_id: string,
  { db, logger }: ModelOptions
): Promise<Job[]> => {
  const log = logger.prefix("createJobsForSuite");
  log.debug("suite", suite_id);

  const commentJob = await createJob(
    { name: "pull_request_comment", suite_id },
    { db, logger }
  );

  const runs = await findRunsForSuite(suite_id, { db, logger });
  const isSuiteComplete = runs.every((r) =>
    ["fail", "pass"].includes(r.status)
  );

  if (!isSuiteComplete) {
    log.debug("suite not complete");
    return [commentJob];
  }

  const suiteCompleteJobs = await Promise.all([
    createJob({ name: "alert", suite_id }, { db, logger }),
    createJob({ name: "github_commit_status", suite_id }, { db, logger }),
  ]);

  return [commentJob, ...suiteCompleteJobs];
};

export const updateJob = async (
  { completed_at, id }: UpdateJob,
  { db, logger }: ModelOptions
): Promise<Job> => {
  const log = logger.prefix("updateJob");
  log.debug("update job", id);

  const jobs = await db("jobs").where({ id }).update({ completed_at }, "*");
  const job = jobs[0] || null;

  if (!job) {
    log.error("not found", id);
    throw new Error("job not found");
  }

  log.debug("updated");
  return job;
};
