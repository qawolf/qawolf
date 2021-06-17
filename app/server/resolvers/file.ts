import { isNil } from "lodash";

import { ClientError } from "../errors";
import { buildFileUrl, deleteFile } from "../models/file";
import { findRun } from "../models/run";
import { findSuite } from "../models/suite";
import { updateTeam } from "../models/team";
import { findTest, updateTest } from "../models/test";
import { findFilesForBranch, HELPERS_PATH } from "../services/gitHub/tree";
import {
  Context,
  File,
  IdQuery,
  ModelOptions,
  Team,
  Test,
  UpdateFileMutation,
} from "../types";
import { ensureSuiteAccess, ensureTeamAccess, ensureTestAccess } from "./utils";

type BuildFileForTest = {
  branch?: string | null;
  id: string;
};

type FindFileForTeam = {
  branch: string;
  path: string;
  team: Team;
};

type FormatHelpersFile = {
  branch?: string | null;
  team: Team;
};

type FormatTestFile = {
  branch?: string | null;
  test: Test;
};

const fileDelimiter = ".";

const throwInvalidTypeError = (
  logger: Context["logger"],
  type: string
): void => {
  const message = `invalid file type ${type}`;
  logger.alert(message);
  throw new ClientError(message);
};

const ensureFileAccess = async (
  fileId: string,
  { db, logger, teams }: Context
): Promise<void> => {
  const log = logger.prefix("ensureFileAccess");
  const [type, id] = fileId.split(fileDelimiter);

  if (type === "helpers") {
    ensureTeamAccess({ logger, team_id: id, teams });
  } else if (type === "run") {
    const run = await findRun(id, { db, logger });
    await ensureTestAccess({ teams, test_id: run.test_id }, { db, logger });
  } else if (type === "runhelpers") {
    await ensureSuiteAccess({ suite_id: id, teams }, { db, logger });
  } else if (type === "test") {
    await ensureTestAccess({ teams, test_id: id }, { db, logger });
    return;
  } else {
    throwInvalidTypeError(log, type);
  }
};

const findFileForTeam = async (
  { branch, path, team }: FindFileForTeam,
  { db, logger }: ModelOptions
): Promise<string | null> => {
  const log = logger.prefix("findFileForTeam");
  if (!branch || !team.git_sync_integration_id) return null;

  const { files } = await findFilesForBranch(
    { branch, integrationId: team.git_sync_integration_id },
    { db, logger }
  );

  const file = files.find((f) => f.path === path);
  if (!file) {
    log.alert(`file ${path} not found`);
    throw new ClientError(`File ${path} not found in git`);
  }

  return file.text;
};

export const formatHelpersFile = async (
  { branch, team }: FormatHelpersFile,
  { db, ip, logger }: Context
): Promise<File> => {
  const id = `helpers.${team.id}${branch ? `.${branch}` : ""}`;

  return {
    branch: branch || null,
    content: team.helpers,
    id,
    is_deleted: false,
    is_read_only: false,
    path: HELPERS_PATH,
    team_id: team.id,
    url: await buildFileUrl({ id, ip }, { db, logger }),
  };
};

export const formatTestFile = async (
  { branch, test }: FormatTestFile,
  { db, ip, logger }: Context
): Promise<File> => {
  const id = `test.${test.id}${branch ? `.${branch}` : ""}`;

  return {
    branch: branch || null,
    content: test.code,
    id,
    is_deleted: !!test.deleted_at,
    is_read_only: !!test.deleted_at,
    path: test.name || test.path,
    team_id: test.team_id,
    url: await buildFileUrl({ id, ip }, { db, logger }),
  };
};

const buildFileForRun = async (
  id: string,
  { db, ip, logger, teams }: Context
): Promise<File> => {
  const run = await findRun(id, { db, logger });
  const test = await findTest(run.test_id, { db, logger });
  await ensureTestAccess({ teams, test }, { db, logger });

  const fileId = `run.${id}`;

  return {
    branch: null,
    content: run.code,
    id: fileId,
    is_deleted: false,
    is_read_only: true,
    path: test.path || test.name,
    team_id: test.team_id,
    url: await buildFileUrl({ id: fileId, ip }, { db, logger }),
  };
};

const buildFileForSuite = async (
  id: string,
  { db, ip, logger, teams }: Context
): Promise<File> => {
  await ensureSuiteAccess({ suite_id: id, teams }, { db, logger });
  const suite = await findSuite(id, { db, logger });

  const fileId = `runhelpers.${id}`;

  return {
    branch: null,
    content: suite.helpers,
    id: fileId,
    is_deleted: false,
    is_read_only: true,
    path: HELPERS_PATH,
    team_id: suite.team_id,
    url: await buildFileUrl({ id: fileId, ip }, { db, logger }),
  };
};

const buildFileForTeam = async (
  { branch, id }: BuildFileForTest,
  context: Context
): Promise<File> => {
  const { db, logger, teams } = context;
  const team = ensureTeamAccess({ logger, team_id: id, teams });

  const gitContent = await findFileForTeam(
    { branch, path: HELPERS_PATH, team },
    { db, logger }
  );
  const content = isNil(gitContent) ? team.helpers : gitContent;

  return {
    ...(await formatHelpersFile({ branch, team }, context)),
    content,
  };
};

const buildFileForTest = async (
  { branch, id }: BuildFileForTest,
  context: Context
): Promise<File> => {
  const { db, logger, teams } = context;

  const test = await findTest(id, { db, logger });
  const team = await ensureTestAccess({ test, teams }, { db, logger });

  const gitContent = await findFileForTeam(
    { branch, path: test.path, team },
    { db, logger }
  );
  const content = isNil(gitContent) ? test.code : gitContent;

  return {
    ...(await formatTestFile({ branch, test }, context)),
    content,
  };
};

export const deleteFileResolver = async (
  _: Record<string, unknown>,
  { id: fileId }: IdQuery,
  context: Context
): Promise<string> => {
  const { db, logger } = context;
  const log = logger.prefix("fileResolver");
  log.debug("file", deleteFileResolver);

  await ensureFileAccess(fileId, context);
  const deletedFile = await deleteFile(fileId, { db, logger });

  return deletedFile.id;
};

export const fileResolver = async (
  _: Record<string, unknown>,
  { id: fileId }: IdQuery,
  context: Context
): Promise<File> => {
  const log = context.logger.prefix("fileResolver");
  log.debug("file", fileId);

  const [type, id, branch] = fileId.split(fileDelimiter);

  if (type === "helpers") {
    return buildFileForTeam({ branch, id }, context);
  }
  if (type === "run") {
    return buildFileForRun(id, context);
  }
  if (type === "runhelpers") {
    return buildFileForSuite(id, context);
  }
  if (type === "test") {
    return buildFileForTest({ branch, id }, context);
  }

  throwInvalidTypeError(log, type);
};

export const updateFileResolver = async (
  _: Record<string, unknown>,
  { content, id: fileId, path }: UpdateFileMutation,
  context: Context
): Promise<File> => {
  const { db, logger } = context;
  const log = logger.prefix("updateFileResolver");
  log.debug("file", fileId);

  await ensureFileAccess(fileId, context);
  const [type, id] = fileId.split(fileDelimiter);

  if (type === "helpers") {
    const team = await updateTeam({ helpers: content, id }, { db, logger });

    return formatHelpersFile({ team }, context);
  }
  if (type === "test") {
    const test = await updateTest(
      { code: content, id, name: path },
      { db, logger }
    );

    return formatTestFile({ test }, context);
  }

  throwInvalidTypeError(log, type);
};
