import { createSuiteForTrigger } from "../models/suite";
import { ensureTeamCanCreateSuite, findTeam } from "../models/team";
import { findPendingTriggers, updateTrigger } from "../models/trigger";
import { ModelOptions } from "../types";

export const orchestrateTriggers = async ({
  db,
  logger,
}: ModelOptions): Promise<void> => {
  const log = logger.prefix("orchestrateTriggers");

  const triggers = await findPendingTriggers({ db, logger });

  const triggerPromises = triggers.map(async (trigger) => {
    try {
      const team = await findTeam(trigger.team_id, { db, logger });
      ensureTeamCanCreateSuite(team, logger);

      await db.transaction(async (trx) => {
        await createSuiteForTrigger({ trigger }, { db: trx, logger });

        // providing repeat_minutes will push forward next_at
        if (trigger.repeat_minutes) {
          await updateTrigger(
            { id: trigger.id, repeat_minutes: trigger.repeat_minutes },
            { db: trx, logger }
          );
        }
      });
    } catch (error) {
      log.error("error", error.message);
    }
  });

  await Promise.all(triggerPromises);

  log.debug("success");
};
