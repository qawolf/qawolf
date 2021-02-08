import { db } from "../db";
import { Logger } from "../Logger";
import { findPendingGroups, updateGroupNextAt } from "../models/trigger";
import { createSuiteForTests } from "../models/suite";
import { findEnabledTestsForGroup } from "../models/test";
import { Group } from "../types";

type RunGroup = {
  group: Group;
  logger: Logger;
};

// TODO this and handleSuitesRequest should be combined
export const runGroup = async ({ logger, group }: RunGroup): Promise<void> => {
  const { id, team_id } = group;
  const log = logger.prefix("runGroup");

  log.debug("group", id, "team", team_id);

  await db.transaction(async (trx) => {
    const tests = await findEnabledTestsForGroup(
      { group_id: id },
      { logger, trx }
    );

    if (tests.length) {
      await createSuiteForTests(
        { group_id: id, team_id, tests },
        { logger, trx }
      );
    } else {
      log.debug("skip creating suite, no enabled tests");
    }

    return updateGroupNextAt(group, { logger, trx });
  });
};

export const orchestrateGroups = async (logger: Logger): Promise<void> => {
  const log = logger.prefix("orchestrateGroups");

  const groups = await findPendingGroups({ logger });
  const groupPromises = groups.map((group) => runGroup({ group, logger }));
  await Promise.all(groupPromises);

  log.debug("success");
};
