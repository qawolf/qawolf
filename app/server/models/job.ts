import { Job, JobName, ModelOptions } from "../types";
import { cuid } from "../utils";
import { findRunsForSuite } from "./run";

type CreateJob = {
  name: JobName;
  suite_id: string;
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
    ON CONFLICT (name, suite_id) WHERE started_at IS NULL
    DO UPDATE SET updated_at = now()`,
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
