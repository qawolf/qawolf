import { findRun } from "../models/run";
import { Context, Runner } from "../types";
import { ensureTeams, ensureTestAccess, ensureUser } from "./utils";

type RunnerQuery = {
  request_test_runner?: boolean;
  run_id?: string;
  test_branch?: string;
  test_id?: string;
};

export const runnerResolver = async (
  _: Record<string, unknown>,
  { run_id, test_id }: RunnerQuery,
  { db, logger, user: contextUser, teams }: Context
): Promise<Runner | null> => {
  const log = logger.prefix("runnerResolver");

  const user = ensureUser({ logger, user: contextUser });
  ensureTeams({ logger, teams });
  log.debug(user.id);

  const run = run_id ? await findRun(run_id, { db, logger }) : null;
  const testId = run?.test_id || test_id;
  if (!testId) throw new Error(`test not found ${testId}`);

  await ensureTestAccess({ teams, test_id: testId }, { db, logger });

  // TODO for now just return the localhost runner...
  // XXX request a runner by session key (run_id, test_id_branch)
  // we need to track this centrally to send to the same region

  return {
    // TODO env vriables
    vnc_url: "ws://localhost:",
    ws_url: "ws://localhost:",
  };
};
