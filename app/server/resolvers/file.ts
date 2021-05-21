import { ClientError } from "../errors";
import { findTest } from "../models/test";
import { Context, File, IdQuery } from "../types";
import { ensureTestAccess } from "./utils";

const fileDelimiter = ".";

export const buildFileForTest = async (
  id: string,
  { db, logger, teams }: Context
): Promise<File> => {
  const test = await findTest(id, { db, logger });
  const team = await ensureTestAccess({ test, teams }, { db, logger });

  return {
    id,
    is_read_only: false,
    name: test.name || null,
    path: test.path || null,
  };
};

export const fileResolver = async (
  _: Record<string, unknown>,
  { id: fileId }: IdQuery,
  context: Context
): Promise<File> => {
  const log = context.logger.prefix("fileResolver");
  log.debug("file", fileId);

  const [type, id] = fileId.split(fileDelimiter);

  if (type === "test") {
    return buildFileForTest(id, context);
  }

  const message = `invalid file type ${type}`;
  log.alert(message);
  throw new ClientError(message);
};
