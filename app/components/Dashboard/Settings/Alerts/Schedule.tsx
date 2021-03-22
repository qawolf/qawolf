import { Box } from "grommet";
import { ChangeEvent } from "react";

import { useUpdateTeam } from "../../../../hooks/mutations";
import { TeamWithUsers } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import Divider from "../../../shared/Divider";
import Text from "../../../shared/Text";
import Alert from "./Alert";

type Props = { team: TeamWithUsers };

export default function Schedule({ team }: Props): JSX.Element {
  const [updateTeam] = useUpdateTeam();

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const updates = {
      alert_only_on_failure: e.target.value !== copy.alertsAlways,
    };

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
    <Box margin={{ bottom: "medium" }}>
      <Text color="gray9" margin={{ bottom: "xxsmall" }} size="componentBold">
        {copy.alertsReceive}
      </Text>
      <Alert
        isChecked={!team.alert_only_on_failure}
        label={copy.alertsAlways}
        noIcon
        onChange={handleChange}
        value={copy.alertsAlways}
      />
      <Alert
        isChecked={team.alert_only_on_failure}
        label={copy.alertsOnlyOnFailure}
        noIcon
        onChange={handleChange}
        value={copy.alertsOnlyOnFailure}
      />
      <Divider />
    </Box>
  );
}
