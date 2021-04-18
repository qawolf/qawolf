import { findRunsForSuite } from "../../models/run";
import { findSuite } from "../../models/suite";
import { findTeam } from "../../models/team";
import { findTriggerOrNull } from "../../models/trigger";
import { ModelOptions, SuiteRun, Team } from "../../types";
import { sendEmailAlert } from "./email";
import { sendSlackAlert } from "./slack";

type ShouldSendAlert = {
  runs: SuiteRun[];
  team: Team;
};

export const shouldSendAlert = ({ runs, team }: ShouldSendAlert): boolean => {
  if (!team.alert_only_on_failure) return true;

  return runs.some((r) => r.status === "fail");
};

export const sendAlert = async (
  suite_id: string,
  options: ModelOptions
): Promise<void> => {
  const log = options.logger.prefix("sendAlert");
  log.debug("suite", suite_id);

  const suite = await findSuite(suite_id, options);

  const runs = await findRunsForSuite(suite.id, options);

  if (runs.some((r) => r.status === "created")) {
    log.debug("skip: suite not complete");
    return;
  }

  const team = await findTeam(suite.team_id, options);

  if (!shouldSendAlert({ runs, team })) {
    log.debug("skip: should not send alert");
    return;
  }

  const trigger = await findTriggerOrNull(suite.trigger_id, options);

  if (team.is_email_alert_enabled) {
    await sendEmailAlert({ runs, suite, trigger }, options);
  }

  if (team.alert_integration_id) {
    await sendSlackAlert(
      {
        integrationId: team.alert_integration_id,
        runs,
        suite,
        trigger,
      },
      options
    );
  }
};
