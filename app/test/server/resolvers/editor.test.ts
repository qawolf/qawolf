import {
  buildTestCode,
  buildTreeForCommit,
  commitTestAndHelpers,
  editorResolver,
  findHelpersForEditor,
  saveEditorResolver,
  updateTestAndHelpers,
} from "../../../server/resolvers/editor";
import * as syncService from "../../../server/services/gitHub/sync";
import * as treeService from "../../../server/services/gitHub/tree";
import { Editor, RunResult } from "../../../server/types";
import { prepareTestDb } from "../db";
import {
  buildIntegration,
  buildRun,
  buildSuite,
  buildTeam,
  buildTest,
  buildTrigger,
  buildUser,
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
const options = { db, logger: context.logger };

beforeAll(async () => {
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

describe("buildTestCode", () => {
  it("returns code from git files if possible", () => {
    const code = buildTestCode({ files, test }, options);

    expect(code).toBe("git code");
  });

  it("returns test code if no files", () => {
    const code = buildTestCode({ files: null, test }, options);

    expect(code).toBe("test code");
  });

  it("throws an error if files but test not found", () => {
    expect(() => {
      buildTestCode({ files: [], test }, options);
    }).toThrowError("not found");
  });
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
      options
    );

    expect(helpers).toBe("git helpers");
    expect(updatedTest.path).toBe("qawolf/renamed.test.js");

    await db("tests").where({ id: test.id }).update({ path: test.path });
  });

  it("throws an error if test or helpers not found", async () => {
    await expect(
      (): Promise<Editor> => {
        return commitTestAndHelpers(
          {
            branch: "feature",
            code: "// new code",
            team,
            test: { ...test, path: "qawolf/oops.test.js" },
          },
          options
        );
      }
    ).rejects.toThrowError("No helpers or test file");
  });
});

describe("editorResolver", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns helpers, run, and test without branch", async () => {
    jest.spyOn(treeService, "findFilesForBranch");

    const { helpers, run, test } = await editorResolver(
      {},
      { branch: null, test_id: "testId" },
      context
    );

    expect(helpers).toBe("team helpers");
    expect(run).toBeNull();
    expect(test).toMatchObject({ code: "test code", id: "testId" });

    expect(treeService.findFilesForBranch).not.toBeCalled();
  });

  it("returns helpers, run, and test for a run", async () => {
    const { helpers, run, test } = await editorResolver(
      {},
      { branch: null, run_id: "runId" },
      context
    );

    expect(helpers).toBe("suite helpers");
    expect(run).toMatchObject({ id: "runId" });
    expect(test).toMatchObject({ code: "test code", id: "testId" });

    expect(treeService.findFilesForBranch).not.toBeCalled();
  });

  it("returns helpers, run, and test with branch", async () => {
    jest
      .spyOn(treeService, "findFilesForBranch")
      .mockResolvedValue({ files, owner: "qawolf", repo: "repo" });

    const { helpers, run, test } = await editorResolver(
      {},
      { branch: "feature", test_id: "testId" },
      context
    );

    expect(helpers).toBe("git helpers");
    expect(run).toBeNull();
    expect(test).toMatchObject({ code: "git code", id: "testId" });

    expect(treeService.findFilesForBranch).toBeCalled();
  });

  it("throws an error if no run or test id passed", async () => {
    await expect(
      async (): Promise<Editor> => {
        return editorResolver({}, {}, context);
      }
    ).rejects.toThrowError("Must provide test_id or run_id");
  });
});

describe("findHelpersForEditor", () => {
  it("returns helpers from suite if run passed", async () => {
    const helpers = await findHelpersForEditor(
      { files: null, run: run as RunResult, team },
      options
    );

    expect(helpers).toBe("suite helpers");
  });

  it("returns helpers from files if files passed", async () => {
    const helpers = await findHelpersForEditor(
      { files, run: null, team },
      options
    );

    expect(helpers).toBe("git helpers");
  });

  it("returns helpers from team otherwise", async () => {
    const helpers = await findHelpersForEditor(
      { files: null, run: null, team },
      options
    );

    expect(helpers).toBe("team helpers");
  });
});

describe("saveEditorResolver", () => {
  it("updates test and helpers without branch", async () => {
    await db("tests")
      .where({ id: "testId" })
      .update({ name: "old name", path: null });

    const { helpers, test: updatedTest } = await saveEditorResolver(
      {},
      {
        code: "new code",
        helpers: "new helpers",
        name: "new name",
        test_id: "testId",
      },
      context
    );

    expect(helpers).toBe("new helpers");
    expect(updatedTest).toMatchObject({ code: "new code", name: "new name" });

    await db("teams").where({ id: "teamId" }).update({ helpers: team.helpers });
    await db("tests")
      .where({ id: "testId" })
      .update({ code: test.code, name: null, path: test.path });
  });
});

describe("updateTestAndHelpers", () => {
  it("updates helpers", async () => {
    const { helpers, test: updatedTest } = await updateTestAndHelpers(
      { helpers: "new helpers", name: null, team, test },
      options
    );

    expect(helpers).toBe("new helpers");
    expect(updatedTest.code).toBe(test.code);
    expect(updatedTest.name).toBe(test.name);

    const updatedTeam = await db("teams").first();
    expect(updatedTeam.helpers).toBe("new helpers");

    await db("teams").where({ id: "teamId" }).update({ helpers: team.helpers });
  });

  it("updates test code and name", async () => {
    await db("tests")
      .where({ id: "testId" })
      .update({ name: "old name", path: null });

    const { helpers, test: updatedTest } = await updateTestAndHelpers(
      { code: "new code", name: "new name", team, test },
      options
    );

    expect(helpers).toBe("team helpers");
    expect(updatedTest).toMatchObject({ code: "new code", name: "new name" });

    await db("tests")
      .where({ id: "testId" })
      .update({ code: test.code, name: null, path: test.path });
  });

  it("updates test code only", async () => {
    const { helpers, test: updatedTest } = await updateTestAndHelpers(
      { code: "another code", team, test },
      options
    );

    expect(helpers).toBe("team helpers");
    expect(updatedTest).toMatchObject({ code: "another code" });

    await db("tests").where({ id: "testId" }).update({ code: test.code });
  });

  it("updates test name only", async () => {
    await db("tests")
      .where({ id: "testId" })
      .update({ name: "old name", path: null });

    const { helpers, test: updatedTest } = await updateTestAndHelpers(
      { name: "another name", team, test },
      options
    );

    expect(helpers).toBe("team helpers");
    expect(updatedTest).toMatchObject({ name: "another name" });

    await db("tests")
      .where({ id: "testId" })
      .update({ name: null, path: test.path });
  });
});
