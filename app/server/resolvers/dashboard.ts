import { Context, GroupIdQuery } from "../types";
import { ensureUser } from "./utils";

/**
 * @returns Dashboard data (tests and suites) for a single test group.
 *   Actual data is resolved by suitesResolver and testsResolver.
 */
export const dashboardResolver = (
  _: Record<string, unknown>,
  { group_id }: GroupIdQuery,
  { logger, user: contextUser }: Context
): { group_id: string } => {
  const log = logger.prefix("dashboardResolver");

  const user = ensureUser({ logger, user: contextUser });

  log.debug(`user ${user.id} for group ${group_id}`);

  return { group_id };
};
