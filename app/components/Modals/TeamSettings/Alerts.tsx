import { Box, RadioButtonGroup } from "grommet";
import { ChangeEvent, useContext } from "react";

import { useUpdateTeam } from "../../../hooks/mutations";
import { useIntegrations } from "../../../hooks/queries";
import { Team } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import Text from "../../shared/Text";
import { StateContext } from "../../StateContext";
import AddSlack from "./AddSlack";

type Props = { team: Team };

const emailValue = "email";

export default function Alerts({ team }: Props): JSX.Element {
  const { teamId } = useContext(StateContext);

  const { data } = useIntegrations({ team_id: teamId });
  const [updateTeam] = useUpdateTeam();

  const slackIntegrations = (data?.integrations || []).filter(
    (i) => i.type === "slack"
  );

  const slackOptions = slackIntegrations.map((i) => {
    return {
      label: copy.alertSlack({
        channel: i.slack_channel,
        team_name: i.team_name,
      }),
      value: i.id,
    };
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    let updates: Partial<Team> = {};

    if (e.target.value === emailValue) {
      updates = { alert_integration_id: null, is_email_alert_enabled: true };
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

  return (
    <Box margin={{ top: "large" }}>
      <Text color="gray" margin={{ bottom: "medium" }} size="medium">
        {copy.alerts}
      </Text>
      <RadioButtonGroup
        name="alerts"
        onChange={handleChange}
        options={[
          { label: copy.alertEmail, value: emailValue },
          ...slackOptions,
        ]}
        value={
          team.is_email_alert_enabled ? emailValue : team.alert_integration_id
        }
      />
      <AddSlack />
    </Box>
  );
}
