import { updateTeam } from "../../../server/models/team";
import { updateTest } from "../../../server/models/test";
import {
  deleteFileResolver,
  fileResolver,
  updateFileResolver,
} from "../../../server/resolvers/file";
import * as treeService from "../../../server/services/gitHub/tree";
import { File } from "../../../server/types";
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
const test2 = buildTest({ code: "test code", i: 2 });

const db = prepareTestDb();
const context = { ...testContext, db, teams: [team] };
const options = { db, logger: context.logger };

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

  await db("tests").insert([test, test2]);
  await db("runs").insert(run);
});

describe("deleteFileResolver", () => {
  beforeAll(() => db("files").insert({ id: "test.testId", url: "testUrl" }));

  afterAll(() => db("files").del());

  it("deletes a file", async () => {
    const fileId = await deleteFileResolver({}, { id: "test.testId" }, context);
    const files = await db("files");

    expect(fileId).toBe("test.testId");
    expect(files).toEqual([]);
  });
});

describe("fileResolver", () => {
  it("returns a helpers file", async () => {
    const file = await fileResolver({}, { id: "helpers.teamId" }, context);

    expect(file).toEqual({
      branch: null,
      content: team.helpers,
      id: "helpers.teamId",
      is_deleted: false,
      is_read_only: false,
      path: treeService.HELPERS_PATH,
      team_id: "teamId",
      url: "wss://eastus2.qawolf.com",
    });
  });

  it("returns a run file", async () => {
    const file = await fileResolver({}, { id: "run.runId" }, context);

    expect(file).toEqual({
      branch: null,
      content: run.code,
      id: "run.runId",
      is_deleted: false,
      is_read_only: true,
      path: test.path,
      team_id: "teamId",
      url: "wss://eastus2.qawolf.com",
    });
  });

  it("returns a run helpers file", async () => {
    const file = await fileResolver({}, { id: "runhelpers.suiteId" }, context);

    expect(file).toEqual({
      branch: null,
      content: "suite helpers",
      id: "runhelpers.suiteId",
      is_deleted: false,
      is_read_only: true,
      path: treeService.HELPERS_PATH,
      team_id: "teamId",
      url: "wss://eastus2.qawolf.com",
    });
  });

  it("returns a test file without branch", async () => {
    jest.spyOn(treeService, "findFilesForBranch");

    const file = await fileResolver({}, { id: "test.test2Id" }, context);

    expect(file).toEqual({
      branch: null,
      content: test2.code,
      id: "test.test2Id",
      is_deleted: false,
      is_read_only: false,
      path: test2.name,
      team_id: "teamId",
      url: "wss://eastus2.qawolf.com",
    });

    expect(treeService.findFilesForBranch).not.toBeCalled();
  });

  it("returns a test file with branch", async () => {
    jest
      .spyOn(treeService, "findFilesForBranch")
      .mockResolvedValue({ files, owner: "qawolf", repo: "repo" });

    const file = await fileResolver({}, { id: "test.testId.feature" }, context);

    expect(file).toEqual({
      branch: "feature",
      content: "git code",
      id: "test.testId.feature",
      is_deleted: false,
      is_read_only: false,
      path: test.path,
      team_id: "teamId",
      url: "wss://eastus2.qawolf.com",
    });

    expect(treeService.findFilesForBranch).toBeCalled();
  });

  it("throws an error if invalid file type", async () => {
    await expect(
      (): Promise<File> => {
        return fileResolver({}, { id: "invalid.id" }, context);
      }
    ).rejects.toThrowError("invalid file type");
  });
});

describe("updateFileResolver", () => {
  it("updates a helpers file", async () => {
    const oldHelpers = team.helpers;

    const file = await updateFileResolver(
      {},
      { content: "new helpers", id: "helpers.teamId" },
      context
    );

    expect(file).toEqual({
      branch: null,
      content: "new helpers",
      id: "helpers.teamId",
      is_deleted: false,
      is_read_only: false,
      path: treeService.HELPERS_PATH,
      team_id: "teamId",
      url: "wss://eastus2.qawolf.com",
    });

    await updateTeam({ helpers: oldHelpers, id: "teamId" }, options);
  });

  it("updates a test file content", async () => {
    const oldCode = test2.code;

    const file = await updateFileResolver(
      {},
      { content: "new code", id: "test.test2Id" },
      context
    );

    expect(file).toEqual({
      branch: null,
      content: "new code",
      id: "test.test2Id",
      is_deleted: false,
      is_read_only: false,
      path: test2.name,
      team_id: "teamId",
      url: "wss://eastus2.qawolf.com",
    });

    await updateTest({ code: oldCode, id: "test2Id" }, options);
  });

  it("updates a test file path", async () => {
    const oldName = test2.name;

    const file = await updateFileResolver(
      {},
      { id: "test.test2Id", path: "new name" },
      context
    );

    expect(file).toEqual({
      branch: null,
      content: test2.code,
      id: "test.test2Id",
      is_deleted: false,
      is_read_only: false,
      path: "new name",
      team_id: "teamId",
      url: "wss://eastus2.qawolf.com",
    });

    await updateTest({ id: "test2Id", name: oldName }, options);
  });

  it("throws an error if invalid file type", async () => {
    await expect(
      (): Promise<File> => {
        return updateFileResolver({}, { id: "invalid.id" }, context);
      }
    ).rejects.toThrowError("invalid file type");
  });
});
