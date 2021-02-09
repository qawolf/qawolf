import { Context, TriggerIdQuery } from "../types";
import { ensureUser } from "./utils";

/**
 * @returns Dashboard data (tests and suites) for a single test trigger.
 *   Actual data is resolved by suitesResolver and testsResolver.
 */
export const dashboardResolver = (
  _: Record<string, unknown>,
  { trigger_id }: TriggerIdQuery,
  { logger, user: contextUser }: Context
): { trigger_id: string } => {
  const log = logger.prefix("dashboardResolver");

  const user = ensureUser({ logger, user: contextUser });

  log.debug(`user ${user.id} for trigger ${trigger_id}`);

  return { trigger_id };
};
