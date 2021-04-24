/* eslint-disable @typescript-eslint/no-explicit-any */
import * as testModel from "../../../../server/models/test";
import {
  deleteGitHubTests,
  upsertGitHubTests,
} from "../../../../server/resolvers/test/gitHubTests";
import * as gitHubFile from "../../../../server/services/gitHub/file";
import * as gitHubTree from "../../../../server/services/gitHub/tree";
import { prepareTestDb } from "../../db";
import {
  buildGroup,
  buildIntegration,
  buildRun,
  buildTeam,
  buildTeamUser,
  buildTest,
  buildTrigger,
  buildUser,
  logger,
} from "../../utils";

const run = buildRun({ code: "run code" });

const db = prepareTestDb();
const options = { db, logger };

beforeAll(async () => {
  await db("users").insert([buildUser({}), buildUser({ i: 2 })]);
  await db("teams").insert([buildTeam({}), buildTeam({ i: 2 })]);
  await db("team_users").insert([
    buildTeamUser({}),
    buildTeamUser({ i: 2, team_id: "team2Id", user_id: "user2Id" }),
  ]);

  await db("groups").insert(buildGroup({}));
  await db("integrations").insert([
    buildIntegration({ type: "github_sync" }),
    buildIntegration({ i: 2, type: "github_sync" }),
  ]);

  await db("triggers").insert([
    buildTrigger({}),
    buildTrigger({ i: 2, team_id: "team2Id" }),
    buildTrigger({ i: 3 }),
  ]);

  await db("tests").insert([
    buildTest({ name: "My Test" }),
    buildTest({ i: 2, name: "Other Test" }),
    buildTest({
      creator_id: "user2Id",
      i: 3,
      team_id: "team2Id",
    }),
  ]);

  await db("test_triggers").insert({
    id: "testTriggerId",
    test_id: "testId",
    trigger_id: "triggerId",
  });

  return db("runs").insert(run);
});

describe("deleteGitHubTests", () => {
  it("deletes tests from GitHub", async () => {
    jest.spyOn(gitHubTree, "findTestsForBranch").mockResolvedValue({
      tests: [
        { path: "group/myTest.test.js", sha: "sha" },
        { path: "anotherTest.test.js", sha: "sha2" },
      ],
    } as any);
    const spy = jest.spyOn(gitHubFile, "deleteFile").mockResolvedValue();

    const team = await db("teams").where({ id: "teamId" }).first();
    const tests = await db("tests").whereIn("id", ["testId", "test2Id"]);

    await deleteGitHubTests({ branch: "main", teams: [team], tests }, options);

    expect(gitHubFile.deleteFile).toBeCalledTimes(1);
    expect(spy.mock.calls[0][0]).toMatchObject({
      branch: "main",
      path: "qawolf/group/myTest.test.js",
      sha: "sha",
    });
  });

  it("throws an error if multiple integration ids for team", async () => {
    await db("teams")
      .where({ id: "teamId" })
      .update({ git_sync_integration_id: "integrationId" });
    await db("teams")
      .where({ id: "team2Id" })
      .update({ git_sync_integration_id: "integration2Id" });

    const teams = await db("teams");
    const tests = await db("tests").whereIn("id", ["testId", "test2Id"]);

    await expect(
      deleteGitHubTests({ branch: "main", teams, tests }, options)
    ).rejects.toThrowError("multiple teams");

    await db("teams").update({ git_sync_integration_id: null });
  });
});

describe("upsertGitHubTests", () => {
  it("filters out tests not on branch and creates missing tests", async () => {
    jest.spyOn(gitHubTree, "findTestsForBranch").mockResolvedValue({
      tests: [{ path: "group/test.test.js" }, { path: "anotherTest.test.js" }],
    } as any);

    const tests = await testModel.findTestsForTeam("teamId", options);

    const finalTests = await upsertGitHubTests(
      {
        branch: "main",
        integrationId: "integrationId",
        team_id: "teamId",
        tests,
      },
      options
    );

    expect(finalTests).toMatchObject([
      { creator_id: null, name: null, path: "anotherTest.test.js" },
      { name: null, path: "group/test.test.js" },
    ]);

    const newTest = await db("tests").where({ name: "anotherTest" });

    expect(newTest).toBeTruthy();

    await db("tests").where({ name: "anotherTest" }).del();
  });
});
