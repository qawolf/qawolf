import {
  buildTreeForCommit,
  commitEditorResolver,
  commitTestAndHelpers,
} from "../../../server/resolvers/editor";
import * as syncService from "../../../server/services/gitHub/sync";
import * as treeService from "../../../server/services/gitHub/tree";
import { CommitEditor } from "../../../server/types";
import { prepareTestDb } from "../db";
import {
  buildIntegration,
  buildRun,
  buildSuite,
  buildTeam,
  buildTest,
  buildTrigger,
  buildUser,
  createRunnerLocations,
  testContext,
} from "../utils";

const files = [
  { path: "qawolf/helpers/index.js", sha: "sha", text: "git helpers" },
  { path: "qawolf/myTest.test.js", sha: "sha", text: "git code" },
];

const run = buildRun({ suite_id: "suiteId" });
const team = buildTeam({
  git_sync_integration_id: "integrationId",
  helpers: "team helpers",
});
const test = buildTest({ code: "test code", path: "qawolf/myTest.test.js" });

const db = prepareTestDb();
const context = { ...testContext, db, teams: [team] };

beforeAll(async () => {
  await createRunnerLocations(db);

  await db("teams").insert({ ...team, git_sync_integration_id: null });
  await db("users").insert(buildUser({}));

  await db("integrations").insert(buildIntegration({}));
  await db("teams")
    .where({ id: "teamId" })
    .update({ git_sync_integration_id: "integrationId" });

  await db("triggers").insert(buildTrigger({}));
  await db("suites").insert(buildSuite({ helpers: "suite helpers" }));

  await db("tests").insert(test);
  await db("runs").insert(run);
});

describe("buildTreeForCommit", () => {
  it("handles renaming the file", () => {
    expect(
      buildTreeForCommit({ path: "qawolf/renamed.test.js", testFile: files[1] })
    ).toMatchSnapshot();
  });

  it("handles updating code and helpers", () => {
    expect(
      buildTreeForCommit({
        code: "// new code",
        helpers: "// new helpers",
        testFile: files[1],
      })
    ).toMatchSnapshot();
  });
});

describe("commitTestAndHelpers", () => {
  beforeEach(() => {
    jest
      .spyOn(treeService, "findFilesForBranch")
      .mockResolvedValue({ files, owner: "qawolf", repo: "repo" });

    jest.spyOn(syncService, "createCommit").mockResolvedValue();
  });

  afterEach(() => jest.clearAllMocks());

  it("updates test path if applicable", async () => {
    const { helpers, test: updatedTest } = await commitTestAndHelpers(
      {
        branch: "feature",
        path: "qawolf/renamed.test.js",
        team,
        test,
      },
      context
    );

    expect(helpers).toEqual({
      branch: "feature",
      content: "git helpers",
      id: "helpers.teamId.feature",
      is_deleted: false,
      is_read_only: false,
      path: treeService.HELPERS_PATH,
      team_id: "teamId",
      url: "wss://eastus2.qawolf.com",
    });
    expect(updatedTest.path).toBe("qawolf/renamed.test.js");

    await db("tests").where({ id: test.id }).update({ path: test.path });
  });

  it("throws an error if test or helpers not found", async () => {
    await expect(
      (): Promise<CommitEditor> => {
        return commitTestAndHelpers(
          {
            branch: "feature",
            code: "// new code",
            team,
            test: { ...test, path: "qawolf/oops.test.js" },
          },
          context
        );
      }
    ).rejects.toThrowError("No helpers or test file");
  });
});

describe("commitEditorResolver", () => {
  beforeEach(() => {
    jest
      .spyOn(treeService, "findFilesForBranch")
      .mockResolvedValue({ files, owner: "qawolf", repo: "repo" });

    jest.spyOn(syncService, "createCommit").mockResolvedValue();
  });

  afterEach(() => jest.clearAllMocks());

  it("commits an editor state", async () => {
    const { helpers, test } = await commitEditorResolver(
      {},
      {
        branch: "feature",
        code: "new code",
        path: "qawolf/renamed.test",
        test_id: "testId",
      },
      context
    );

    expect(helpers).toEqual({
      branch: "feature",
      content: "git helpers",
      id: "helpers.teamId.feature",
      is_deleted: false,
      is_read_only: false,
      path: treeService.HELPERS_PATH,
      team_id: "teamId",
      url: "wss://eastus2.qawolf.com",
    });
    expect(test).toEqual({
      branch: "feature",
      content: "new code",
      id: "test.testId.feature",
      is_deleted: false,
      is_read_only: false,
      path: "qawolf/renamed.test",
      team_id: "teamId",
      url: "wss://eastus2.qawolf.com",
    });
  });
});
