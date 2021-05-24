import { ClientError } from "../errors";
import { findRun } from "../models/run";
import { findTest } from "../models/test";
import { findFilesForBranch } from "../services/gitHub/tree";
import {
  Context,
  File,
  FileQuery,
  GitHubFile,
  ModelOptions,
  Test,
} from "../types";
import { ensureTestAccess } from "./utils";

type BuildFileForTest = {
  branch?: string | null;
  id: string;
};

type BuildTestContent = {
  files: GitHubFile[] | null;
  test: Test;
};

const fileDelimiter = ".";

export const buildTestContent = (
  { files, test }: BuildTestContent,
  { logger }: ModelOptions
): string => {
  const log = logger.prefix("buildTestContent");

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

const buildFileForRun = async (
  id: string,
  { db, logger, teams }: Context
): Promise<File> => {
  const run = await findRun(id, { db, logger });
  const test = await findTest(run.test_id, { db, logger });
  await ensureTestAccess({ teams, test }, { db, logger });

  return {
    content: run.code,
    id,
    is_read_only: true,
    path: test.path || test.name,
  };
};

const buildFileForTest = async (
  { branch, id }: BuildFileForTest,
  { db, logger, teams }: Context
): Promise<File> => {
  const test = await findTest(id, { db, logger });
  const team = await ensureTestAccess({ test, teams }, { db, logger });

  let files: GitHubFile[] | null = null;

  if (branch && team.git_sync_integration_id) {
    const branchFiles = await findFilesForBranch(
      { branch, integrationId: team.git_sync_integration_id },
      { db, logger }
    );
    files = branchFiles.files;
  }

  return {
    content: buildTestContent({ files, test }, { db, logger }),
    id,
    is_read_only: false,
    path: test.path || test.name,
  };
};

export const fileResolver = async (
  _: Record<string, unknown>,
  { branch, id: fileId }: FileQuery,
  context: Context
): Promise<File> => {
  const log = context.logger.prefix("fileResolver");
  log.debug("file", fileId);

  const [type, id] = fileId.split(fileDelimiter);

  if (type === "run") {
    return buildFileForRun(id, context);
  }
  if (type === "test") {
    return buildFileForTest({ branch, id }, context);
  }

  const message = `invalid file type ${type}`;
  log.alert(message);
  throw new ClientError(message);
};
