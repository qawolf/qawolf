import { ClientError } from "../errors";
import { findRunResult } from "../models/run";
import { findSuite } from "../models/suite";
import { findTest, findTestForRun } from "../models/test";
import {
  buildHelpersForFiles,
  findFilesForBranch,
} from "../services/gitHub/tree";
import {
  Context,
  Editor,
  EditorQuery,
  GitHubFile,
  ModelOptions,
  RunResult,
  Team,
  Test,
} from "../types";
import { ensureTestAccess } from "./utils";

type BuildTestCode = {
  files: GitHubFile[] | null;
  test: Test;
};

type FindHelpersForEditor = {
  files: GitHubFile[] | null;
  run: RunResult | null;
  team: Team;
};

type FindTestForEditor = {
  run_id?: string | null;
  teams: Team[];
  test_id?: string | null;
};

export const buildTestCode = (
  { files, test }: BuildTestCode,
  { logger }: ModelOptions
): string => {
  const log = logger.prefix("buildTestCode");

  if (!files) {
    log.debug("no files");
    return test.code;
  }

  const gitTest = files.find((f) => f.path === test.path);
  if (!gitTest) {
    log.alert(`test ${test.id} not found`);
    throw new ClientError(`Test ${test.path} not found in git`);
  }

  return gitTest.text;
};

export const findHelpersForEditor = async (
  { files, run, team }: FindHelpersForEditor,
  options: ModelOptions
): Promise<string> => {
  if (run?.suite_id) {
    const suite = await findSuite(run.suite_id, options);
    return suite.helpers;
  }

  if (files) {
    return buildHelpersForFiles(files, options);
  }

  return team.helpers;
};

export const findTestForEditor = async (
  { run_id, teams, test_id }: FindTestForEditor,
  options: ModelOptions
): Promise<Test> => {
  const test = test_id
    ? await findTest(test_id, options)
    : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await findTestForRun(run_id!, options);

  return test;
};

export const editorResolver = async (
  _: Record<string, unknown>,
  { branch, run_id, test_id }: EditorQuery,
  { db, logger, teams }: Context
): Promise<Editor> => {
  const log = logger.prefix("editorResolver");
  log.debug("test", test_id, "run", run_id);

  if (!run_id && !test_id) {
    log.error("no run or test id passed");
    throw new ClientError("Must provide test_id or run_id");
  }

  const run = run_id ? await findRunResult(run_id, { db, logger }) : null;
  const test = await findTestForEditor(
    { run_id, teams, test_id },
    { db, logger }
  );

  const team = await ensureTestAccess({ teams, test }, { db, logger });
  if (run) {
    await ensureTestAccess({ teams, test_id: run.test_id }, { db, logger });
  }

  let files: GitHubFile[] | null = null;

  if (branch && team.git_sync_integration_id) {
    const branchFiles = await findFilesForBranch(
      { branch, integrationId: team.git_sync_integration_id },
      { db, logger }
    );
    files = branchFiles.files;
  }

  const helpers = await findHelpersForEditor(
    { files, run, team },
    { db, logger }
  );

  return {
    helpers,
    run,
    test: { ...test, code: buildTestCode({ files, test }, { db, logger }) },
  };
};
