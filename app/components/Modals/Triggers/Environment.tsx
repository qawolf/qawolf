import { Box, RadioButtonGroup } from "grommet";
import { ChangeEvent, useContext } from "react";

import { useEnvironments } from "../../../hooks/queries";
import { copy } from "../../../theme/copy";
import Text from "../../shared-new/Text";
import { StateContext } from "../../StateContext";

type Props = {
  selectedEnvironmentId: string;
  setSelectedEnvironmentId: (environmentId: string) => void;
};

export default function Environment({
  selectedEnvironmentId,
  setSelectedEnvironmentId,
}: Props): JSX.Element {
  const { environmentId, teamId } = useContext(StateContext);
  const { data } = useEnvironments({ team_id: teamId }, { environmentId });

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSelectedEnvironmentId(e.target.value);
  };

  let environmentsHtml = null;
  const environments = data?.environments;

  if (environments?.length) {
    const options = environments.map((e) => {
      return { label: e.name, value: e.id };
    });

    environmentsHtml = (
      <RadioButtonGroup
        direction="row"
        gap="medium"
        name="environment"
        onChange={handleChange}
        options={options}
        value={selectedEnvironmentId}
        wrap
      />
    );
  } else if (environments) {
    environmentsHtml = (
      <RadioButtonGroup
        name="environment"
        onChange={handleChange}
        options={[{ label: copy.none, value: null }]}
        value={null}
      />
    );
  }

  return (
    <Box margin={{ bottom: "medium" }}>
      <Text
        color="gray9"
        margin={{ bottom: "small", top: "medium" }}
        size="componentBold"
      >
        {copy.environment}
      </Text>
      {environmentsHtml}
    </Box>
  );
}
