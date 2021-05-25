import isNil from "lodash/isNil";

import { ClientError } from "../errors";
import { findTest, updateTest } from "../models/test";
import { BLOB_MODE, createCommit, Tree } from "../services/gitHub/sync";
import { findFilesForBranch, HELPERS_PATH } from "../services/gitHub/tree";
import {
  CommitEditor,
  CommitEditorMutation,
  Context,
  GitHubFile,
  ModelOptions,
  Team,
  Test,
} from "../types";
import { formatHelpersFile, formatTestFile } from "./file";
import { ensureTeamAccess, ensureTestAccess } from "./utils";

type BuildTreeForCommit = {
  code?: string | null;
  helpers?: string | null;
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

export const buildTreeForCommit = ({
  code,
  helpers,
  path,
  testFile,
}: BuildTreeForCommit): BuildTreeForCommitResult => {
  const tree: Tree = [];
  const updates: string[] = [];

  // clear old file if renamed
  if (!isNil(path)) {
    tree.push({
      mode: BLOB_MODE,
      path: testFile.path,
      sha: null,
    });
    updates.push(`rename ${testFile.path}`);
  }

  // write updated test file
  tree.push({
    content: isNil(code) ? testFile.text : code,
    mode: BLOB_MODE,
    path: path || testFile.path,
  });

  if (!isNil(code)) {
    updates.push(`update ${path || testFile.path}`);
  }

  // update helpers file code if needed
  if (!isNil(helpers)) {
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
): Promise<CommitEditor> => {
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

    if (!isNil(path) && path !== testFile.path) {
      // TODO: redirect the client to test with existing path
      // if error due to uniqueness constraint on path and team
      updatedTest = await updateTest({ id: test.id, path }, options);
    }

    const { message, tree } = buildTreeForCommit({
      code,
      helpers,
      path,
      testFile,
    });
    await createCommit({ branch, message, team, tree }, options);

    return {
      helpers: formatHelpersFile({
        ...team,
        helpers: isNil(helpers) ? helpersFile.text : helpers,
      }),
      test: formatTestFile({
        ...updatedTest,
        code: isNil(code) ? testFile.text : code,
      }),
    };
  });
};

export const commitEditorResolver = async (
  _: Record<string, unknown>,
  { branch, code, helpers, path, test_id }: CommitEditorMutation,
  { db, logger, teams }: Context
): Promise<CommitEditor> => {
  const log = logger.prefix("commitEditorResolver");
  log.debug("test", test_id, "branch", branch);

  const test = await findTest(test_id, { db, logger });
  await ensureTestAccess({ teams, test }, { db, logger });
  const team = ensureTeamAccess({ logger, team_id: test.team_id, teams });

  return commitTestAndHelpers(
    { branch, code, helpers, path, team, test },
    { db, logger }
  );
};
