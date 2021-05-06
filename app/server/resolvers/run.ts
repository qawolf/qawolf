import { RunStatus } from "../../lib/types";
import {
  countRunsForTeam,
  findRunsForSuite,
  findStatusCountsForSuite,
  findTestHistory,
} from "../models/run";
import {
  Context,
  IdQuery,
  Run,
  StatusCounts,
  Suite,
  SuiteRun,
  TeamIdQuery,
} from "../types";
import { ensureTeamAccess, ensureTestAccess } from "./utils";

type ShouldRetry = {
  error?: string;
  retries?: number;
  status: RunStatus;
};

export const RETRY_ERRORS = ["page.goto: net::ERR_CONNECTION_REFUSED"];

export const shouldRetry = ({
  error,
  retries,
  status,
}: ShouldRetry): boolean => {
  return (
    status === "fail" &&
    !retries &&
    !!RETRY_ERRORS.find((e) => error?.trim().startsWith(e))
  );
};

/**
 * @returns Count of runs since team was renewed
 */
export const runCountResolver = async (
  _: Record<string, unknown>,
  { team_id }: TeamIdQuery,
  { db, logger, teams }: Context
): Promise<number> => {
  const log = logger.prefix("runCountResolver");
  log.debug("team", team_id);

  const team = ensureTeamAccess({ logger, team_id, teams });

  return countRunsForTeam(team, { db, logger });
};

/**
 * @returns StatusCounts for a suite
 */
export const statusCountsResolver = async (
  { id }: Suite,
  _: Record<string, unknown>,
  { db, logger }: Context
): Promise<StatusCounts> => {
  logger.debug("statusCountsResolver: suite", id);
  // access check not needed since done in the parent query

  return findStatusCountsForSuite(id, { db, logger });
};

/**
 * @returns Array of SuiteRuns
 */
export const suiteRunsResolver = async (
  { id }: Suite,
  _: Record<string, unknown>,
  { db, logger }: Context
): Promise<SuiteRun[]> => {
  logger.debug("suiteRunsResolver: suite", id);
  // access check not needed since done in the parent query

  return findRunsForSuite(id, { db, logger });
};

/**
 * @returns Array of Runs
 */
export const testHistoryResolver = async (
  _: Record<string, unknown>,
  { id }: IdQuery,
  { db, logger, teams }: Context
): Promise<Run[]> => {
  const log = logger.prefix("testHistoryResolver");
  log.debug("test", id);

  await ensureTestAccess({ teams, test_id: id }, { db, logger });

  return findTestHistory(id, { db, logger });
};
