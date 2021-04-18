import * as gitHubService from "../../../../server/services/gitHub/app";
import { GitHubCommitStatus } from "../../../../server/types";
import { prepareTestDb } from "../../db";
import {
  buildGitHubCommitStatus,
  buildRun,
  buildSuite,
  buildTeam,
  buildTeamUser,
  buildTest,
  buildTrigger,
  buildUser,
  logger,
} from "../../utils";

const { shouldUpdateCommitStatus, updateCommitStatus } = gitHubService;

const db = prepareTestDb();
const options = { db, logger };

beforeAll(async () => {
  await db("users").insert(buildUser({}));
  await db("teams").insert(buildTeam({}));
  await db("team_users").insert(buildTeamUser({}));

  await db("triggers").insert(buildTrigger({}));

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

describe("shouldUpdateCommitStatus", () => {
  it("returns false if no github commit status", () => {
    expect(
      shouldUpdateCommitStatus({
        gitHubCommitStatus: null,
        logger,
      })
    ).toBe(false);
  });

  it("returns true otherwise", () => {
    expect(
      shouldUpdateCommitStatus({
        gitHubCommitStatus: { id: "statusId" } as GitHubCommitStatus,
        logger,
      })
    ).toBe(true);
  });
});

describe("updateCommitStatus", () => {
  let createCommitStatusSpy: jest.SpyInstance;

  beforeAll(() => {
    createCommitStatusSpy = jest
      .spyOn(gitHubService, "createCommitStatus")
      .mockResolvedValue({
        context: "context",
      } as gitHubService.GitHubCommitStatus);
  });

  afterEach(() => jest.clearAllMocks());

  afterAll(() => jest.restoreAllMocks());

  it("updates github commit status if suite complete", async () => {
    await updateCommitStatus("suiteId", options);

    expect(createCommitStatusSpy.mock.calls[0][0]).toEqual({
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
    await updateCommitStatus("suite2Id", options);

    expect(gitHubService.createCommitStatus).not.toBeCalled();
  });
});
