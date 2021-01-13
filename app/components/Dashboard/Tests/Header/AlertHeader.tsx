import { Alert, Cycle, Icon, MailOption, Slack } from "grommet-icons";

import { Group, Integration } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import { colors, iconSize } from "../../../../theme/theme";
import Text from "../../../shared/Text";

type Props = { group: Group; integrations: Integration[] };

export default function AlertHeader({
  group,
  integrations,
}: Props): JSX.Element {
  let IconComponent: Icon = Alert;
  let headline = copy.alertNone;
  let iconColor = colors.fadedBlue;

  const integration = group.alert_integration_id
    ? integrations.find((i) => i.id === group.alert_integration_id)
    : null;

  if (group.is_email_enabled) {
    IconComponent = MailOption;
    headline = copy.alertEmail;
  } else if (group.alert_integration_id && integration) {
    IconComponent = Slack;
    headline = copy.alertSlack({ channel: integration.slack_channel || "" });
    iconColor = "plain";
  } else if (group.alert_integration_id) {
    // assume that if integration not found for group the query is still loading
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
