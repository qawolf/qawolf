import { db } from "../db";
import {
  createTestTriggersForTrigger,
  deleteTestTriggersForTrigger,
} from "../models/test_trigger";
import {
  createTrigger,
  deleteTrigger,
  findDefaultTriggerForTeam,
  findTriggersForTeam,
  updateTrigger,
} from "../models/trigger";
import {
  Context,
  CreateTriggerMutation,
  DeleteTrigger,
  IdQuery,
  TeamIdQuery,
  Trigger,
  UpdateTriggerMutation,
} from "../types";
import { ensureTeamAccess, ensureTriggerAccess, ensureUser } from "./utils";

/**
 * @returns The new trigger object
 */
export const createTriggerResolver = async (
  _: Record<string, unknown>,
  { team_id, test_ids, ...args }: CreateTriggerMutation,
  { logger, teams, user: contextUser }: Context
): Promise<Trigger> => {
  const log = logger.prefix("createTriggerResolver");

  const user = ensureUser({ logger, user: contextUser });
  ensureTeamAccess({ logger, team_id: team_id, teams });

  log.debug(`user ${user.id} for team ${team_id}`);

  const trigger = await db.transaction(async (trx) => {
    const trigger = await createTrigger(
      { creator_id: user.id, team_id, ...args },
      { logger, trx }
    );

    if (test_ids?.length) {
      await createTestTriggersForTrigger(
        { test_ids, trigger_id: trigger.id },
        { logger, trx }
      );
    }

    return trigger;
  });

  log.debug(`created trigger ${trigger.id} for team ${team_id}`);

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
