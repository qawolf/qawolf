import { db, dropTestDb, migrateDb } from "../../../server/db";
import {
  createGitHubCommitStatus,
  findGitHubCommitStatusForSuite,
  updateGitHubCommitStatus,
} from "../../../server/models/github_commit_status";
import { GitHubCommitStatus } from "../../../server/types";
import { buildGroup, buildSuite, buildTeam, buildUser, logger } from "../utils";

describe("github commit status model", () => {
  beforeAll(async () => {
    await migrateDb();

    await db("users").insert(buildUser({}));
    await db("teams").insert(buildTeam({}));
    await db("groups").insert(buildGroup({}));
    return db("suites").insert(buildSuite({}));
  });

  afterAll(async () => {
    await dropTestDb();
  });

  describe("createGitHubCommitStatus", () => {
    it("creates a GitHub check run", async () => {
      const gitHubCommitStatus = await createGitHubCommitStatus(
        {
          context: "QA Wolf - All Tests",
          deployment_url: "url",
          github_installation_id: 123,
          group_id: "groupId",
          owner: "qawolf",
          repo: "repo",
          sha: "sha",
          suite_id: "suiteId",
        },
        { logger }
      );

      const dbGitHubCommitStatus = await db("github_commit_statuses")
        .select("*")
        .first();

      expect(dbGitHubCommitStatus).toMatchObject(gitHubCommitStatus);
    });
  });

  describe("findGitHubCommitStatusForSuite", () => {
    it("finds a github commit status for a suite", async () => {
      const gitHubCommitStatus = await findGitHubCommitStatusForSuite(
        "suiteId",
        { logger }
      );

      expect(gitHubCommitStatus).toMatchObject({ suite_id: "suiteId" });
    });

    it("returns null if no github commit status found", async () => {
      const gitHubCommitStatus = await findGitHubCommitStatusForSuite(
        "fakeId",
        { logger }
      );

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
        { logger }
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
      const testFn = async (): Promise<GitHubCommitStatus> => {
        return updateGitHubCommitStatus(
          { completed_at: new Date().toISOString(), id: "fakeId" },
          { logger }
        );
      };

      await expect(testFn()).rejects.toThrowError("not found");
    });
  });
});
