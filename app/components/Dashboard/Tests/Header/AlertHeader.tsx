import { Alert, Cycle, Icon, MailOption, Slack } from "grommet-icons";

import { Integration, Trigger } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import { colors, iconSize } from "../../../../theme/theme";
import Text from "../../../shared/Text";

type Props = {
  integrations: Integration[];
  trigger: Trigger;
};

export default function AlertHeader({
  integrations,
  trigger,
}: Props): JSX.Element {
  let IconComponent: Icon = Alert;
  let headline = copy.alertNone;
  let iconColor = colors.fadedBlue;

  const integration = trigger.alert_integration_id
    ? integrations.find((i) => i.id === trigger.alert_integration_id)
    : null;

  if (trigger.is_email_enabled) {
    IconComponent = MailOption;
    headline = copy.alertEmail;
  } else if (trigger.alert_integration_id && integration) {
    IconComponent = Slack;
    headline = copy.alertSlack({ channel: integration.slack_channel || "" });
    iconColor = "plain";
  } else if (trigger.alert_integration_id) {
    // assume that if integration not found for trigger the query is still loading
    IconComponent = Cycle;
    headline = copy.loading;
  }

  return (
    <>
      <IconComponent color={iconColor} size={iconSize} />
      <Text
        color="fadedBlue"
        margin={{ horizontal: "small" }}
        size="medium"
        weight="bold"
      >
        {headline}
      </Text>
    </>
  );
}
