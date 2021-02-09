import { minutesFromNow } from "../../../shared/utils";
import { Logger } from "../../Logger";
import { findRunsForSuite } from "../../models/run";
import { findSuite, updateSuite } from "../../models/suite";
import { findTeam } from "../../models/team";
import { findTrigger } from "../../models/trigger";
import { SuiteRun, Team } from "../../types";
import { sendEmailAlert } from "./email";
import { sendSlackAlert } from "./slack";

type SendAlert = {
  logger: Logger;
  suite_id: string;
};

type ShouldSendAlert = {
  runs: SuiteRun[];
  team: Team;
};

export const shouldSendAlert = ({ runs, team }: ShouldSendAlert): boolean => {
  if (!team.alert_only_on_failure) return true;

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

  const team = await findTeam(suite.team_id, { logger });

  if (!shouldSendAlert({ runs, team })) {
    log.debug("skip: should not send alert");
    return;
  }

  const trigger = await findTrigger(suite.trigger_id, { logger });

  if (team.is_email_alert_enabled) {
    await sendEmailAlert({ logger, runs, suite, trigger });
  }

  if (team.alert_integration_id) {
    await sendSlackAlert({
      integrationId: team.alert_integration_id,
      logger,
      runs,
      suite,
      trigger,
    });
  }
};
