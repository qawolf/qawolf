import { updateTagTriggersForTrigger } from "../models/tag_trigger";
import {
  createTrigger,
  deleteTrigger,
  findTriggersForTeam,
  updateTrigger,
} from "../models/trigger";
import { trackSegmentEvent } from "../services/segment";
import {
  Context,
  CreateTriggerMutation,
  IdQuery,
  ModelOptions,
  Team,
  TeamIdQuery,
  Trigger,
  UpdateTriggerMutation,
} from "../types";
import {
  ensureTagAccess,
  ensureTeamAccess,
  ensureTriggerAccess,
  ensureUser,
} from "./utils";

type UpdateTagTriggers = {
  tag_ids?: string[] | null;
  team: Team;
  trigger_id: string;
};

const updateTagTriggers = async (
  { tag_ids, team, trigger_id }: UpdateTagTriggers,
  { db, logger }: ModelOptions
): Promise<void> => {
  const log = logger.prefix("updateTagTriggers");
  if (!tag_ids) {
    log.debug("skip, no tag ids");
    return;
  }

  log.debug("tags", tag_ids);

  await Promise.all(
    tag_ids.map((tag_id) => {
      return ensureTagAccess({ tag_id, teams: [team] }, { db, logger });
    })
  );

  await updateTagTriggersForTrigger({ tag_ids, trigger_id }, { db, logger });
};

/**
 * @returns The new trigger object
 */
export const createTriggerResolver = async (
  _: Record<string, unknown>,
  { tag_ids, team_id, ...args }: CreateTriggerMutation,
  { db, logger, teams, user: contextUser }: Context
): Promise<Trigger> => {
  const log = logger.prefix("createTriggerResolver");

  const user = ensureUser({ logger, user: contextUser });
  const team = ensureTeamAccess({ logger, team_id: team_id, teams });

  log.debug(`user ${user.id} for team ${team_id}`);

  const trigger = await db.transaction(async (trx) => {
    const trigger = await createTrigger(
      { ...args, creator_id: user.id, team_id },
      { db: trx, logger }
    );

    await updateTagTriggers(
      { tag_ids, team, trigger_id: trigger.id },
      { db: trx, logger }
    );

    return trigger;
  });

  trackSegmentEvent({
    active: true,
    event: "Trigger Created",
    user,
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
  { db, logger, teams }: Context
): Promise<Trigger> => {
  const log = logger.prefix("deleteTriggerResolver");
  log.debug("trigger", id);

  await ensureTriggerAccess({ trigger_id: id, teams }, { db, logger });

  const trigger = await deleteTrigger(id, { db, logger });
  log.debug("deleted trigger", id);

  return trigger;
};

/**
 * @returns An array of the non-deleted triggers for the team,
 *   sorted alphabetically ascending by name.
 */
export const triggersResolver = async (
  _: Record<string, unknown>,
  { team_id }: TeamIdQuery,
  { db, logger, teams }: Context
): Promise<Trigger[]> => {
  ensureTeamAccess({ logger, team_id, teams });

  return findTriggersForTeam(team_id, { db, logger });
};

/**
 * @returns Updated trigger object
 */
export const updateTriggerResolver = async (
  _: Record<string, unknown>,
  { tag_ids, ...args }: UpdateTriggerMutation,
  { db, logger, teams }: Context
): Promise<Trigger> => {
  logger.debug("updateTriggerResolver", args.id);

  const team = await ensureTriggerAccess(
    { teams, trigger_id: args.id },
    { db, logger }
  );

  return db.transaction(async (trx) => {
    const trigger = await updateTrigger(args, { db: trx, logger });

    await updateTagTriggers(
      { tag_ids, team, trigger_id: trigger.id },
      { db: trx, logger }
    );

    return trigger;
  });
};
