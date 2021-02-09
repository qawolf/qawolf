import { db } from "../db";
import { Logger } from "../Logger";
import { createSuiteForTests } from "../models/suite";
import { findEnabledTestsForTrigger } from "../models/test";
import { findPendingTriggers, updateTriggerNextAt } from "../models/trigger";
import { Trigger } from "../types";

type RunTrigger = {
  logger: Logger;
  trigger: Trigger;
};

// TODO this and handleSuitesRequest should be combined
export const runTrigger = async ({
  logger,
  trigger,
}: RunTrigger): Promise<void> => {
  const { id, team_id } = trigger;
  const log = logger.prefix("runTrigger");

  log.debug("trigger", id, "team", team_id);

  await db.transaction(async (trx) => {
    const tests = await findEnabledTestsForTrigger(
      { trigger_id: id },
      { logger, trx }
    );

    if (tests.length) {
      await createSuiteForTests(
        { trigger_id: id, team_id, tests },
        { logger, trx }
      );
    } else {
      log.debug("skip creating suite, no enabled tests");
    }

    return updateTriggerNextAt(trigger, { logger, trx });
  });
};

export const orchestrateTriggers = async (logger: Logger): Promise<void> => {
  const log = logger.prefix("orchestrateTriggers");

  const triggers = await findPendingTriggers({ logger });
  const triggerPromises = triggers.map((trigger) =>
    runTrigger({ logger, trigger })
  );
  await Promise.all(triggerPromises);

  log.debug("success");
};
