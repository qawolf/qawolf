import { ModelOptions, TagTrigger } from "../types";
import { cuid } from "../utils";

type UpdateTagTriggersForTrigger = {
  tag_ids: string[];
  trigger_id: string;
};

export const updateTagTriggersForTrigger = async (
  { tag_ids, trigger_id }: UpdateTagTriggersForTrigger,
  { db, logger }: ModelOptions
): Promise<TagTrigger[]> => {
  const log = logger.prefix("updateTagTriggersForTrigger");
  log.debug("trigger", trigger_id, "tags", tag_ids);

  return db.transaction(async (trx) => {
    const tagTriggers = await trx("tag_triggers").where({ trigger_id });

    const extraTagTriggerIds = tagTriggers
      .filter((tagTrigger) => {
        return !tag_ids.includes(tagTrigger.tag_id);
      })
      .map((tagTrigger) => tagTrigger.id);

    const missingTagIds = tag_ids.filter((tag_id) => {
      return !tagTriggers.some((tagTrigger) => tagTrigger.tag_id === tag_id);
    });

    if (extraTagTriggerIds.length) {
      await trx("tag_triggers").whereIn("id", extraTagTriggerIds).del();
    }

    if (missingTagIds.length) {
      const newTagTriggers = missingTagIds.map((tag_id) => {
        return {
          id: cuid(),
          tag_id,
          trigger_id,
        };
      });

      await trx("tag_triggers").insert(newTagTriggers);
      log.debug(`created ${newTagTriggers}.length tag triggers`);
    }

    return trx("tag_triggers").where({ trigger_id });
  });
};
