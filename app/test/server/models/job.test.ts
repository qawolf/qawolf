import { createJob, createJobsForSuite } from "../../../server/models/job";
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

  it("does not create a duplicate job", async () => {
    await db("jobs").insert(buildJob({}));

    await createJob(
      { name: "pull_request_comment", suite_id: "suiteId" },
      options
    );

    const dbJobs = await db("jobs");

    expect(dbJobs).toHaveLength(1);
    expect(new Date(dbJobs[0].created_at).toISOString()).not.toBe(
      new Date(dbJobs[0].updated_at).toISOString()
    );
  });
});

describe("createJobsForSuite", () => {
  beforeAll(() =>
    db("runs").insert([
      buildRun({ status: "pass", suite_id: "suiteId" }),
      buildRun({ i: 2, status: "fail", suite_id: "suiteId" }),
    ])
  );

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
