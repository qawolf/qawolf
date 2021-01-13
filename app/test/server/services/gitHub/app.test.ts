import { db, dropTestDb, migrateDb } from "../../../../server/db";
import * as gitHubService from "../../../../server/services/gitHub/app";
import { GitHubCommitStatus, SuiteRun } from "../../../../server/types";
import {
  buildGitHubCommitStatus,
  buildGroup,
  buildRun,
  buildSuite,
  buildTeam,
  buildTeamUser,
  buildTest,
  buildUser,
  logger,
} from "../../utils";

const { shouldUpdateCommitStatus, updateCommitStatus } = gitHubService;

beforeAll(async () => {
  await migrateDb();

  await db("users").insert(buildUser({}));
  await db("teams").insert(buildTeam({}));
  await db("team_users").insert(buildTeamUser({}));

  await db("groups").insert(buildGroup({}));

  await db("suites").insert([buildSuite({}), buildSuite({ i: 2 })]);

  await db("tests").insert(buildTest({ name: "testName" }));

  await db("runs").insert([
    buildRun({
      completed_at: new Date().toISOString(),
      i: 2,
      status: "fail",
      suite_id: "suiteId",
    }),
    buildRun({
      completed_at: new Date().toISOString(),
      i: 3,
      status: "pass",
      suite_id: "suiteId",
    }),
    buildRun({ status: "created", suite_id: "suite2Id" }),
  ]);

  return db("github_commit_statuses").insert(buildGitHubCommitStatus({}));
});

afterAll(() => dropTestDb());

describe("shouldUpdateCommitStatus", () => {
  it("returns false if no github commit status", () => {
    expect(
      shouldUpdateCommitStatus({
        gitHubCommitStatus: null,
        logger,
        runs: [{ status: "pass" }] as SuiteRun[],
      })
    ).toBe(false);
  });

  it("returns false if some runs are not complete", () => {
    expect(
      shouldUpdateCommitStatus({
        gitHubCommitStatus: { id: "statusId" } as GitHubCommitStatus,
        logger,
        runs: [{ status: "pass" }, { status: "created" }] as SuiteRun[],
      })
    ).toBe(false);
  });

  it("returns true otherwise", () => {
    expect(
      shouldUpdateCommitStatus({
        gitHubCommitStatus: { id: "statusId" } as GitHubCommitStatus,
        logger,
        runs: [{ status: "pass" }, { status: "fail" }] as SuiteRun[],
      })
    ).toBe(true);
  });
});

describe("updateCommitStatus", () => {
  beforeAll(() => {
    jest.spyOn(gitHubService, "createCommitStatus").mockResolvedValue({
      context: "context",
    } as gitHubService.GitHubCommitStatus);
  });

  afterEach(() => jest.clearAllMocks());

  afterAll(() => jest.restoreAllMocks());

  it("updates github commit status if suite complete", async () => {
    await updateCommitStatus({ logger, suite_id: "suiteId" });

    expect(gitHubService.createCommitStatus).toBeCalledWith({
      context: "context",
      installationId: 123,
      owner: "qawolf",
      repo: "repo",
      sha: "sha",
      state: "failure",
      suiteId: "suiteId",
    });

    const gitHubCommitStatus = await db("github_commit_statuses")
      .select("*")
      .first();

    expect(gitHubCommitStatus.completed_at).toBeTruthy();
  });

  it("does nothing if suite not complete", async () => {
    await updateCommitStatus({ logger, suite_id: "suite2Id" });

    expect(gitHubService.createCommitStatus).not.toBeCalled();
  });
});
