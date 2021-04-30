import { ClientError } from "../errors";
import { findRunResult } from "../models/run";
import { findSuite } from "../models/suite";
import { updateTeam } from "../models/team";
import { findTest, updateTest } from "../models/test";
import { BLOB_MODE, createCommit, Tree } from "../services/gitHub/sync";
import {
  buildHelpersForFiles,
  findFilesForBranch,
  HELPERS_PATH,
} from "../services/gitHub/tree";
import {
  Context,
  Editor,
  EditorQuery,
  GitHubFile,
  ModelOptions,
  RunResult,
  SaveEditorMutation,
  Team,
  Test,
} from "../types";
import { ensureTeamAccess, ensureTestAccess } from "./utils";

type BuildTestCode = {
  files: GitHubFile[] | null;
  test: Test;
};

type BuildTreeForCommit = {
  code?: string | null;
  helpers?: string | null;
  helpersFile: GitHubFile;
  path?: string | null;
  testFile: GitHubFile;
};

type BuildTreeForCommitResult = {
  message: string;
  tree: Tree;
};

type CommitTestAndHelpers = {
  branch: string;
  code?: string | null;
  helpers?: string | null;
  path?: string | null;
  team: Team;
  test: Test;
};

type FindHelpersForEditor = {
  files: GitHubFile[] | null;
  run: RunResult | null;
  team: Team;
};

type TestUpdates = {
  code?: string | null;
  id: string;
  name?: string | null;
};

type UpdateTestAndHelpers = {
  code?: string | null;
  helpers?: string | null;
  name?: string | null;
  team: Team;
  test: Test;
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

export const buildTreeForCommit = ({
  code,
  helpers,
  helpersFile,
  path,
  testFile,
}: BuildTreeForCommit): BuildTreeForCommitResult => {
  const tree: Tree = [];
  const updates: string[] = [];

  // clear old file if renamed
  if (path && path !== testFile.path) {
    tree.push({
      mode: BLOB_MODE,
      path: testFile.path,
      sha: null,
    });
    updates.push(`rename ${testFile.path}`);
  }

  // write updated test file
  tree.push({
    content: code || testFile.text,
    mode: BLOB_MODE,
    path: path || testFile.path,
  });

  if (code && code !== testFile.text) {
    updates.push(`update ${path || testFile.path}`);
  }

  // update helpers file code if needed
  if (helpers && helpers !== helpersFile.text) {
    tree.push({
      content: helpers,
      mode: BLOB_MODE,
      path: HELPERS_PATH,
    });
    updates.push(`update ${HELPERS_PATH}`);
  }

  return { message: updates.join(", "), tree };
};

export const commitTestAndHelpers = async (
  { branch, code, helpers, path, team, test }: CommitTestAndHelpers,
  { db, logger }: ModelOptions
): Promise<Editor> => {
  const log = logger.prefix("commitTestAndHelpers");

  return db.transaction(async (trx) => {
    const options = { db: trx, logger };
    let updatedTest = test;

    const { files } = await findFilesForBranch(
      { branch, integrationId: team.git_sync_integration_id },
      options
    );

    const helpersFile = files.find((f) => f.path === HELPERS_PATH);
    const testFile = files.find((f) => f.path === test.path);
    // TODO: we should handle these cases better
    if (!helpersFile || !testFile) {
      log.error(`team ${team.id} missing helpers or test file`);
      throw new ClientError(`No helpers or test file ${test.path} in git`);
    }

    const { message, tree } = buildTreeForCommit({
      code,
      helpers,
      helpersFile,
      path,
      testFile,
    });
    await createCommit({ branch, message, team, tree }, options);

    if (path) updatedTest = await updateTest({ id: test.id, path }, options);

    return {
      helpers: helpers || helpersFile.text,
      test: { ...updatedTest, code: code || testFile.text },
    };
  });
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

export const updateTestAndHelpers = async (
  { code, helpers, name, team, test }: UpdateTestAndHelpers,
  { db, logger }: ModelOptions
): Promise<Editor> => {
  return db.transaction(async (trx) => {
    const options = { db: trx, logger };
    let updatedTest = test;

    if (code || name) {
      const updates: TestUpdates = { id: test.id };
      if (code) updates.code = code;
      if (name) updates.name = name;

      updatedTest = await updateTest(updates, options);
    }

    if (helpers) {
      await updateTeam({ helpers, id: test.team_id }, options);
    }

    return { helpers: helpers || team.helpers, test: updatedTest };
  });
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
  const test = await findTest(run?.test_id || test_id, { db, logger });
  const team = await ensureTestAccess({ teams, test }, { db, logger });

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

export const saveEditorResolver = async (
  _: Record<string, unknown>,
  { branch, code, helpers, name, path, test_id }: SaveEditorMutation,
  { db, logger, teams }: Context
): Promise<Editor> => {
  const log = logger.prefix("saveEditorResolver");
  log.debug("test", test_id, "branch", branch);

  const test = await findTest(test_id, { db, logger });
  await ensureTestAccess({ teams, test }, { db, logger });
  const team = ensureTeamAccess({ logger, team_id: test.team_id, teams });

  if (branch && team.git_sync_integration_id) {
    return commitTestAndHelpers(
      { branch, code, helpers, path, team, test },
      { db, logger }
    );
  }

  return updateTestAndHelpers(
    { code, helpers, name, team, test },
    { db, logger }
  );
};
