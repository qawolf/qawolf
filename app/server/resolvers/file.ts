import { ClientError } from "../errors";
import { findRun } from "../models/run";
import { updateTeam } from "../models/team";
import { findTest, updateTest } from "../models/test";
import { findFilesForBranch, HELPERS_PATH } from "../services/gitHub/tree";
import {
  Context,
  File,
  FileQuery,
  GitHubFile,
  ModelOptions,
  Team,
  Test,
  UpdateFileMutation,
} from "../types";
import { ensureTeamAccess, ensureTestAccess } from "./utils";

type BuildFileForTest = {
  branch?: string | null;
  id: string;
};

type BuildTestContent = {
  files: GitHubFile[] | null;
  test: Test;
};

const fileDelimiter = ".";

const formatHelpersFile = ({ helpers, id }: Team): File => {
  return {
    content: helpers,
    id: `helpers.${id}`,
    is_read_only: false,
    path: HELPERS_PATH,
  };
};

const formatTestFile = (test: Test): File => {
  return {
    content: test.code,
    id: `test.${test.id}`,
    is_read_only: false,
    path: test.name || test.path,
  };
};

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
    id: `run.${id}`,
    is_read_only: true,
    path: test.path || test.name,
  };
};

const buildFileForTeam = async (
  id: string,
  { logger, teams }: Context
): Promise<File> => {
  const team = ensureTeamAccess({ logger, team_id: id, teams });

  return formatHelpersFile(team);
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
    ...formatTestFile(test),
    content: buildTestContent({ files, test }, { db, logger }),
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

  if (type === "helpers") {
    return buildFileForTeam(id, context);
  }
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

export const updateFileResolver = async (
  _: Record<string, unknown>,
  { content, id: fileId, path }: UpdateFileMutation,
  { db, logger, teams }: Context
): Promise<File> => {
  const log = logger.prefix("updateFileResolver");
  log.debug("file", fileId);

  const [type, id] = fileId.split(fileDelimiter);

  if (type === "helpers") {
    ensureTeamAccess({ logger, team_id: id, teams });
    const team = await updateTeam({ helpers: content, id }, { db, logger });

    return formatHelpersFile(team);
  }
  if (type === "test") {
    await ensureTestAccess({ teams, test_id: id }, { db, logger });
    const test = await updateTest(
      { code: content, id, name: path },
      { db, logger }
    );

    return formatTestFile(test);
  }

  const message = `invalid file type ${type}`;
  log.alert(message);
  throw new ClientError(message);
};
