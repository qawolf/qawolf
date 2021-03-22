import { Box } from "grommet";
import { ChangeEvent } from "react";

import { useUpdateTeam } from "../../../../hooks/mutations";
import { Integration, TeamWithUsers } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import Divider from "../../../shared/Divider";
import Text from "../../../shared/Text";
import AddSlackChannel from "./AddSlackChannel";
import Alert, { emailValue } from "./Alert";

type Props = {
  integrations: Integration[];
  team: TeamWithUsers;
};

export default function Channel({ integrations, team }: Props): JSX.Element {
  const [updateTeam] = useUpdateTeam();

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    let updates: Partial<TeamWithUsers> = {};

    if (e.target.value === emailValue) {
      updates = {
        alert_integration_id: null,
        is_email_alert_enabled: true,
      };
    } else {
      updates = {
        alert_integration_id: e.target.value,
        is_email_alert_enabled: false,
      };
    }

    updateTeam({
      optimisticResponse: {
        updateTeam: {
          ...team,
          ...updates,
        },
      },
      variables: { ...updates, id: team.id },
    });
  };

  const selectedValue = team.is_email_alert_enabled
    ? emailValue
    : team.alert_integration_id;

  const slackAlertsHtml = integrations.map((i) => {
    return (
      <Alert
        integration={i}
        isChecked={i.id === selectedValue}
        key={i.id}
        onChange={handleChange}
      />
    );
  });

  return (
    <>
      <Text color="gray9" margin={{ bottom: "small" }} size="componentBold">
        {copy.alertsChannel}
      </Text>
      <AddSlackChannel teamId={team.id} />
      <Box margin={{ top: "medium" }}>
        <Alert isChecked={selectedValue === "email"} onChange={handleChange} />
        {slackAlertsHtml}
      </Box>
      <Divider />
    </>
  );
}
