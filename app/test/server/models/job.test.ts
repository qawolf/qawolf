import {
  claimPendingJob,
  countPendingJobs,
  createJob,
  createJobsForSuite,
  updateJob,
} from "../../../server/models/job";
import { minutesFromNow } from "../../../shared/utils";
import { prepareTestDb } from "../db";
import {
  buildJob,
  buildRun,
  buildSuite,
  buildTeam,
  buildTest,
  buildTrigger,
  buildUser,
  logger,
} from "../utils";

const db = prepareTestDb();
const options = { db, logger };

beforeAll(async () => {
  await db("users").insert(buildUser({}));
  await db("teams").insert(buildTeam({}));

  await db("tests").insert(buildTest({}));
  await db("triggers").insert(buildTrigger({}));

  await db("suites").insert(buildSuite({}));
});

describe("claimPendingJob", () => {
  afterEach(() => db("jobs").del());

  it("claims the earliest pending job", async () => {
    await db("jobs").insert(buildJob({}));
    await db("jobs").insert(buildJob({ i: 2, name: "alert" }));

    const job = await claimPendingJob(options);

    expect(job).toMatchObject({ id: "jobId" });
  });

  it("returns null if no jobs to claim", async () => {
    const job = await claimPendingJob(options);

    expect(job).toBeNull();
  });
});

describe("countPendingJobs", () => {
  afterEach(() => db("jobs").del());

  it("returns count of pending jobs", async () => {
    await db("jobs").insert([
      buildJob({}),
      buildJob({ i: 2, name: "alert" }),
      buildJob({
        i: 3,
        name: "github_commit_status",
        started_at: minutesFromNow(),
      }),
    ]);

    const count = await countPendingJobs(options);

    expect(count).toBe(2);
  });

  it("returns 0 if no pending jobs", async () => {
    const count = await countPendingJobs(options);

    expect(count).toBe(0);
  });
});

describe("createJob", () => {
  afterEach(() => db("jobs").del());

  it("creates a job", async () => {
    const job = await createJob(
      { name: "pull_request_comment", suite_id: "suiteId" },
      options
    );

    const dbJob = await db("jobs").select("*").first();

    expect(dbJob).toMatchObject({
      ...job,
      name: "pull_request_comment",
      suite_id: "suiteId",
    });
  });

  it("does not create a duplicate alert job", async () => {
    await db("jobs").insert(buildJob({ name: "alert" }));

    await createJob({ name: "alert", suite_id: "suiteId" }, options);

    const dbJobs = await db("jobs");

    expect(dbJobs).toHaveLength(1);
  });

  it("does not create a duplicate GitHub commit status job", async () => {
    await db("jobs").insert(buildJob({ name: "github_commit_status" }));

    await createJob(
      { name: "github_commit_status", suite_id: "suiteId" },
      options
    );

    const dbJobs = await db("jobs");

    expect(dbJobs).toHaveLength(1);
  });

  it("does not create a duplicate pull request comment job", async () => {
    await db("jobs").insert(buildJob({ name: "pull_request_comment" }));

    await createJob(
      { name: "pull_request_comment", suite_id: "suiteId" },
      options
    );

    const dbJobs = await db("jobs");

    expect(dbJobs).toHaveLength(1);
  });

  it("creates a duplicate pull request comment job if existing on already started", async () => {
    await db("jobs").insert(
      buildJob({
        name: "pull_request_comment",
        started_at: new Date().toISOString(),
      })
    );

    await createJob(
      { name: "pull_request_comment", suite_id: "suiteId" },
      options
    );

    const dbJobs = await db("jobs");

    expect(dbJobs).toHaveLength(2);
  });
});

describe("createJobsForSuite", () => {
  beforeAll(() =>
    db("runs").insert([
      buildRun({ status: "pass", suite_id: "suiteId" }),
      buildRun({ i: 2, status: "fail", suite_id: "suiteId" }),
    ])
  );

  afterEach(() => db("jobs").del());

  afterAll(() => db("runs").del());

  it("creates all jobs if suite complete", async () => {
    const jobs = await createJobsForSuite("suiteId", options);

    expect(jobs).toMatchObject([
      { name: "pull_request_comment", suite_id: "suiteId" },
      { name: "alert", suite_id: "suiteId" },
      { name: "github_commit_status", suite_id: "suiteId" },
    ]);
  });

  it("creates only a comment job if suite not complete", async () => {
    await db("runs").where({ id: "runId" }).update({ status: "created" });

    const jobs = await createJobsForSuite("suiteId", options);

    expect(jobs).toMatchObject([
      { name: "pull_request_comment", suite_id: "suiteId" },
    ]);

    await db("runs").where({ id: "runId" }).update({ status: "pass" });
  });
});

describe("updateJob", () => {
  const completed_at = minutesFromNow();

  afterEach(() => db("jobs").del());

  it("updates job completed_at", async () => {
    await db("jobs").insert(buildJob({}));

    const job = await updateJob({ completed_at, id: "jobId" }, options);

    expect(job).toMatchObject({
      completed_at: new Date(completed_at),
      id: "jobId",
    });

    const dbJob = await db("jobs").first();

    expect(new Date(dbJob.completed_at).toISOString()).toBe(completed_at);
  });

  it("throws an error if job not found", async () => {
    await expect(() => {
      return updateJob({ completed_at, id: "fakeId" }, options);
    }).rejects.toThrowError("not found");
  });
});
