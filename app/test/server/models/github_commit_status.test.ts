import {
  createGitHubCommitStatus,
  findGitHubCommitStatusForSuite,
  updateGitHubCommitStatus,
} from "../../../server/models/github_commit_status";
import { prepareTestDb } from "../db";
import {
  buildSuite,
  buildTeam,
  buildTrigger,
  buildUser,
  logger,
} from "../utils";

const db = prepareTestDb();
const options = { db, logger };

beforeAll(async () => {
  await db("users").insert(buildUser({}));
  await db("teams").insert(buildTeam({}));
  await db("triggers").insert(buildTrigger({}));
  return db("suites").insert(buildSuite({}));
});

describe("createGitHubCommitStatus", () => {
  it("creates a GitHub check run", async () => {
    const gitHubCommitStatus = await createGitHubCommitStatus(
      {
        context: "QA Wolf - All Tests",
        deployment_url: "url",
        github_installation_id: 123,
        owner: "qawolf",
        repo: "repo",
        sha: "sha",
        suite_id: "suiteId",
        trigger_id: "triggerId",
      },
      options
    );

    const dbGitHubCommitStatus = await db("github_commit_statuses")
      .select("*")
      .first();

    expect(dbGitHubCommitStatus).toMatchObject(gitHubCommitStatus);
  });
});

describe("findGitHubCommitStatusForSuite", () => {
  it("finds a github commit status for a suite", async () => {
    const gitHubCommitStatus = await findGitHubCommitStatusForSuite("suiteId", {
      db,
      logger,
    });

    expect(gitHubCommitStatus).toMatchObject({ suite_id: "suiteId" });
  });

  it("returns null if no github commit status found", async () => {
    const gitHubCommitStatus = await findGitHubCommitStatusForSuite("fakeId", {
      db,
      logger,
    });

    expect(gitHubCommitStatus).toBeNull();
  });
});

describe("updateGitHubCommitStatus", () => {
  it("updates a github commit status", async () => {
    const existingStatus = await db("github_commit_statuses")
      .select("*")
      .first();

    const updated = await updateGitHubCommitStatus(
      { completed_at: new Date().toISOString(), id: existingStatus.id },
      options
    );
    const dbUpdated = await db("github_commit_statuses").select("*").first();

    expect(dbUpdated.completed_at).toBeTruthy();

    expect(dbUpdated).toMatchObject({
      ...updated,
      completed_at: new Date(updated.completed_at),
      updated_at: new Date(updated.updated_at),
    });
  });

  it("throws an error if github commit status not found", async () => {
    await expect(
      updateGitHubCommitStatus(
        { completed_at: new Date().toISOString(), id: "fakeId" },
        options
      )
    ).rejects.toThrowError("not found");
  });
});
