import {
  createPullRequestComment,
  findPullRequestCommentForSuite,
  updatePullRequestComment,
} from "../../../server/models/pull_request_comment";
import { prepareTestDb } from "../db";
import {
  buildIntegration,
  buildPullRequestComment,
  buildSuite,
  buildTeam,
  buildTrigger,
  buildUser,
  logger,
} from "../utils";

const db = prepareTestDb();
const options = { db, logger };

const timestamp = new Date().toISOString();

beforeAll(async () => {
  await db("users").insert(buildUser({}));
  await db("teams").insert(buildTeam({}));

  await db("integrations").insert(buildIntegration({ type: "github" }));
  await db("triggers").insert(buildTrigger({}));
  return db("suites").insert([buildSuite({}), buildSuite({ i: 2 })]);
});

describe("createPullRequestComment", () => {
  afterEach(() => db("pull_request_comments").del());

  it("creates a pull request comment", async () => {
    const comment = await createPullRequestComment(
      {
        body: "# Hello",
        comment_id: 8,
        deployment_integration_id: "integrationId",
        issue_number: 213,
        last_commit_at: timestamp,
        suite_id: "suiteId",
        trigger_id: "triggerId",
        user_id: "userId",
      },
      options
    );

    const dbComment = await db("pull_request_comments").select("*").first();

    expect(dbComment).toMatchObject({
      ...comment,
      last_commit_at: new Date(timestamp),
    });
  });

  describe("findPullRequestCommentForSuite", () => {
    beforeAll(() =>
      db("pull_request_comments").insert(buildPullRequestComment({}))
    );

    afterAll(() => db("pull_request_comments").del());

    it("finds a pull request comment for a suite", async () => {
      const comment = await findPullRequestCommentForSuite("suiteId", {
        db,
        logger,
      });

      expect(comment).toMatchObject({ suite_id: "suiteId" });
    });

    it("returns null if no pull request comment found", async () => {
      const comment = await findPullRequestCommentForSuite("fakeId", options);

      expect(comment).toBeNull();
    });
  });
});

describe("updatePullRequestComment", () => {
  beforeAll(() =>
    db("pull_request_comments").insert(buildPullRequestComment({}))
  );

  afterAll(() => db("pull_request_comments").del());

  it("updates a pull request comment body", async () => {
    const updated = await updatePullRequestComment(
      { body: "new body", id: "pullRequestCommentId" },
      options
    );
    const dbUpdated = await db("pull_request_comments").select("*").first();

    expect(dbUpdated).toMatchObject({
      ...updated,
      body: "new body",
      suite_id: "suiteId",
      updated_at: new Date(updated.updated_at),
    });
  });

  it("updates a pull request body and suite details", async () => {
    const lastCommitAt = "2021-04-01 12:28:54 -0600";

    const updated = await updatePullRequestComment(
      {
        body: "new suite",
        id: "pullRequestCommentId",
        last_commit_at: new Date(lastCommitAt).toISOString(),
        suite_id: "suite2Id",
      },
      options
    );
    const dbUpdated = await db("pull_request_comments").select("*").first();

    expect(dbUpdated).toMatchObject({
      ...updated,
      body: "new suite",
      last_commit_at: new Date(lastCommitAt),
      suite_id: "suite2Id",
      updated_at: new Date(updated.updated_at),
    });
  });

  it("throws an error if pull request comment not found", async () => {
    await expect(
      updatePullRequestComment({ body: "updated", id: "fakeId" }, options)
    ).rejects.toThrowError("not found");
  });
});
