import {
  buildTestCode,
  editorResolver,
  findHelpersForEditor,
  findTestForEditor,
} from "../../../server/resolvers/editor";
import * as treeService from "../../../server/services/gitHub/tree";
import { Editor, RunResult } from "../../../server/types";
import { prepareTestDb } from "../db";
import {
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
const team = buildTeam({ helpers: "team helpers" });
const test = buildTest({ code: "test code", path: "qawolf/myTest.test.js" });

const db = prepareTestDb();
const context = { ...testContext, db, teams: [team] };
const options = { db, logger: context.logger };

beforeAll(async () => {
  await db("teams").insert(team);
  await db("users").insert(buildUser({}));

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

describe("editorResolver", () => {
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
      {
        ...context,
        teams: [
          { ...context.teams[0], git_sync_integration_id: "integrationId" },
        ],
      }
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

describe("findTestForEditor", () => {
  it("returns test for test id", async () => {
    const test = await findTestForEditor(
      { teams: [team], test_id: "testId" },
      options
    );

    expect(test).toMatchObject({ id: "testId" });
  });

  it("returns test for run id", async () => {
    const test = await findTestForEditor(
      { run_id: "runId", teams: [team] },
      options
    );

    expect(test).toMatchObject({ id: "testId" });
  });
});
