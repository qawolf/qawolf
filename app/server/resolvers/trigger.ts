import { db } from "../db";
import { deleteTestTriggersForTrigger } from "../models/test_trigger";
import {
  createTrigger,
  deleteTrigger,
  findDefaultTriggerForTeam,
  findTriggersForTeam,
  findTriggersForTest,
  updateTrigger,
} from "../models/trigger";
import {
  Context,
  CreateTriggerMutation,
  DeleteTrigger,
  IdQuery,
  TeamIdQuery,
  Test,
  Trigger,
  UpdateTriggerMutation,
} from "../types";
import { ensureTeamAccess, ensureTriggerAccess, ensureUser } from "./utils";

/**
 * @returns The new trigger object
 */
export const createTriggerResolver = async (
  _: Record<string, unknown>,
  args: CreateTriggerMutation,
  { logger, teams, user: contextUser }: Context
): Promise<Trigger> => {
  const log = logger.prefix("createTriggerResolver");

  const user = ensureUser({ logger, user: contextUser });
  ensureTeamAccess({ logger, team_id: args.team_id, teams });

  log.debug(`user ${user.id} for team ${args.team_id}`);

  const trigger = await createTrigger(
    { ...args, creator_id: user.id },
    { logger }
  );

  log.debug(`created trigger ${trigger.id} for team ${args.team_id}`);

  return trigger;
};

/**
 * @returns An object with default trigger and deleted trigger IDs
 */
export const deleteTriggerResolver = async (
  _: Record<string, unknown>,
  { id }: IdQuery,
  { logger, teams }: Context
): Promise<DeleteTrigger> => {
  const log = logger.prefix("deleteTriggerResolver");
  log.debug("trigger", id);

  const team = await ensureTriggerAccess({ logger, trigger_id: id, teams });

  const trigger = await db.transaction(async (trx) => {
    await deleteTestTriggersForTrigger({ trigger_id: id }, { logger, trx });
    return deleteTrigger(id, { logger, trx });
  });

  const defaultTrigger = await findDefaultTriggerForTeam(team.id, { logger });

  log.debug("deleted trigger", id);
  return { default_trigger_id: defaultTrigger.id, id: trigger.id };
};

/**
 * @returns An array of the non-deleted triggers for the team,
 *   sorted alphabetically ascending by name.
 */
export const triggersResolver = async (
  _: Record<string, unknown>,
  { team_id }: TeamIdQuery,
  { logger, teams }: Context
): Promise<Trigger[]> => {
  ensureTeamAccess({ logger, team_id, teams });

  return findTriggersForTeam(team_id, { logger });
};

/**
 * @returns An array of the non-deleted triggers this test belongs to,
 *   sorted alphabetically ascending by name.
 */
export const testTriggersResolver = async (
  { id }: Test,
  _: Record<string, unknown>,
  { logger }: Context
): Promise<Trigger[]> => {
  const log = logger.prefix("testTriggersResolver");
  log.debug("test", id);

  return findTriggersForTest(id, { logger });
};

/**
 * @returns Updated trigger object
 */
export const updateTriggerResolver = async (
  _: Record<string, unknown>,
  args: UpdateTriggerMutation,
  { logger, teams }: Context
): Promise<Trigger> => {
  logger.debug("updateTriggerResolver", args.id);
  await ensureTriggerAccess({ logger, teams, trigger_id: args.id });

  return updateTrigger(args, { logger });
};
