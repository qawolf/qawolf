import { updateTagTriggersForTrigger } from "../models/tag_trigger";
import { Context, TagTrigger, UpdateTagTriggersMutation } from "../types";
import { ensureTagAccess, ensureTriggerAccess } from "./utils";

export const updateTagTriggersResolver = async (
  _: Record<string, unknown>,
  { tag_ids, trigger_id }: UpdateTagTriggersMutation,
  { db, logger, teams }: Context
): Promise<TagTrigger[]> => {
  const log = logger.prefix("updateTagTriggersResolver");
  log.debug("trigger", trigger_id);

  const triggerTeam = await ensureTriggerAccess(
    { teams, trigger_id },
    { db, logger }
  );
  const tagTeams = await Promise.all(
    tag_ids.map((tag_id) => {
      return ensureTagAccess({ tag_id, teams }, { db, logger });
    })
  );

  if (!tagTeams.every((team) => team.id === triggerTeam.id)) {
    log.error(
      `multiple teams for tags`,
      tagTeams.map((t) => t.id)
    );
    throw new Error("cannot add tags from another team");
  }

  return updateTagTriggersForTrigger({ tag_ids, trigger_id }, { db, logger });
};
