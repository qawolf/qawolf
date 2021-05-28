import { ClientError } from "../errors";
import { buildFileUrl } from "../models/file";
import { findRun } from "../models/run";
import { findSuite } from "../models/suite";
import { updateTeam } from "../models/team";
import { findTest, updateTest } from "../models/test";
import { findFilesForBranch, HELPERS_PATH } from "../services/gitHub/tree";
import {
  Context,
  File,
  GitHubFile,
  IdQuery,
  ModelOptions,
  Team,
  Test,
  UpdateFileMutation,
} from "../types";
import { ensureSuiteAccess, ensureTeamAccess, ensureTestAccess } from "./utils";

type BuildFileForTest = {
  branch?: string | null;
  files: GitHubFile[] | null;
  id: string;
};

type BuildHelpersContent = {
  files: GitHubFile[] | null;
  team: Team;
};

type BuildTestContent = {
  files: GitHubFile[] | null;
  test: Test;
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
    is_read_only: false,
    path: test.name || test.path,
    team_id: test.team_id,
    url: await buildFileUrl({ id, ip }, { db, logger }),
  };
};

export const buildHelpersContent = (
  { files, team }: BuildHelpersContent,
  { logger }: ModelOptions
): string => {
  const log = logger.prefix("buildTestContent");

  if (!files) {
    log.debug("no files");
    return team.helpers;
  }

  const gitHelpers = files.find((f) => f.path === HELPERS_PATH);
  if (!gitHelpers) {
    log.alert(`helpers for team ${team.id} not found`);
    throw new ClientError("Helpers not found in git");
  }

  return gitHelpers.text;
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
  { branch, files, id }: BuildFileForTest,
  context: Context
): Promise<File> => {
  const { db, logger, teams } = context;

  const team = ensureTeamAccess({ logger, team_id: id, teams });

  return {
    ...(await formatHelpersFile({ branch, team }, context)),
    content: buildHelpersContent({ files, team }, { db, logger }),
  };
};

const buildFileForTest = async (
  { branch, files, id }: BuildFileForTest,
  context: Context
): Promise<File> => {
  const { db, logger, teams } = context;

  const test = await findTest(id, { db, logger });
  await ensureTestAccess({ test, teams }, { db, logger });

  return {
    ...(await formatTestFile({ branch, test }, context)),
    content: buildTestContent({ files, test }, { db, logger }),
  };
};

export const fileResolver = async (
  _: Record<string, unknown>,
  { id: fileId }: IdQuery,
  context: Context
): Promise<File> => {
  const { db, logger, teams } = context;
  const log = logger.prefix("fileResolver");
  log.debug("file", fileId);

  const [type, id, branch] = fileId.split(fileDelimiter);

  if (type === "run") {
    return buildFileForRun(id, context);
  }
  if (type === "runhelpers") {
    return buildFileForSuite(id, context);
  }

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

  if (type === "helpers") {
    return buildFileForTeam({ branch, files, id }, context);
  }
  if (type === "test") {
    return buildFileForTest({ branch, files, id }, context);
  }

  const message = `invalid file type ${type}`;
  log.alert(message);
  throw new ClientError(message);
};

export const updateFileResolver = async (
  _: Record<string, unknown>,
  { content, id: fileId, path }: UpdateFileMutation,
  context: Context
): Promise<File> => {
  const { db, logger, teams } = context;
  const log = logger.prefix("updateFileResolver");
  log.debug("file", fileId);

  const [type, id] = fileId.split(fileDelimiter);

  if (type === "helpers") {
    ensureTeamAccess({ logger, team_id: id, teams });
    const team = await updateTeam({ helpers: content, id }, { db, logger });

    return formatHelpersFile({ team }, context);
  }
  if (type === "test") {
    await ensureTestAccess({ teams, test_id: id }, { db, logger });
    const test = await updateTest(
      { code: content, id, name: path },
      { db, logger }
    );

    return formatTestFile({ test }, context);
  }

  const message = `invalid file type ${type}`;
  log.alert(message);
  throw new ClientError(message);
};
