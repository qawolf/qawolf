import { minutesFromNow } from "../../../shared/utils";
import { Logger } from "../../Logger";
import { findGroup } from "../../models/group";
import { findRunsForSuite } from "../../models/run";
import { findSuite, updateSuite } from "../../models/suite";
import { Group, SuiteRun } from "../../types";
import { sendEmailAlert } from "./email";
import { sendSlackAlert } from "./slack";

type SendAlert = {
  logger: Logger;
  suite_id: string;
};

type ShouldSendAlert = {
  group: Group;
  runs: SuiteRun[];
};

export const shouldSendAlert = ({ group, runs }: ShouldSendAlert): boolean => {
  if (!group.alert_only_on_failure) return true;

  return runs.some((r) => r.status === "fail");
};

export const sendAlert = async ({
  logger,
  suite_id,
}: SendAlert): Promise<void> => {
  const log = logger.prefix("sendAlert");
  log.debug("suite", suite_id);

  const suite = await findSuite(suite_id, { logger });
  if (suite.alert_sent_at) {
    log.alert("already sent alert at", suite.alert_sent_at);
    return;
  }

  const runs = await findRunsForSuite(suite.id, { logger });

  if (runs.some((r) => r.status === "created")) {
    log.debug("skip: suite not complete");
    return;
  }

  await updateSuite(
    { alert_sent_at: minutesFromNow(), id: suite_id },
    { logger }
  );

  const group = await findGroup(suite.group_id, { logger });

  if (!shouldSendAlert({ group, runs })) {
    console.log("RUNS", runs);
    log.debug("skip: should not send alert");
    return;
  }

  if (group.is_email_enabled) {
    await sendEmailAlert({ group, logger, runs, suite });
  }

  if (group.alert_integration_id) {
    await sendSlackAlert({ group, logger, runs, suite });
  }
};
