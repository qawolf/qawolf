import { Box } from "grommet";
import { ChangeEvent } from "react";

import { useUpdateTeam } from "../../../../hooks/mutations";
import { TeamWithUsers } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import { edgeSize } from "../../../../theme/theme";
import Divider from "../../../shared/Divider";
import RadioButtonGroup from "../../../shared/RadioButtonGroup";
import Text from "../../../shared/Text";

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

  const value = team.alert_only_on_failure
    ? copy.alertsOnlyOnFailure
    : copy.alertsAlways;

  return (
    <Box margin={{ bottom: "medium" }}>
      <Text color="gray9" margin={{ bottom: "small" }} size="componentBold">
        {copy.alertsReceive}
      </Text>
      <RadioButtonGroup
        direction="column"
        gap={edgeSize.small}
        name={copy.alertsReceive}
        options={[
          {
            label: copy.alertsAlways,
            value: copy.alertsAlways,
          },
          {
            label: copy.alertsOnlyOnFailure,
            value: copy.alertsOnlyOnFailure,
          },
        ]}
        onChange={handleChange}
        value={value}
      />
      <Divider margin={{ top: "medium" }} />
    </Box>
  );
}
