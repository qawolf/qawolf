import { Box, RadioButtonGroup } from "grommet";
import { ChangeEvent, useContext } from "react";

import { useEnvironments } from "../../../hooks/queries";
import { copy } from "../../../theme/copy";
import Text from "../../shared-new/Text";
import { StateContext } from "../../StateContext";

type Props = {
  environmentId: string;
  setEnvironmentId: (environmentId: string) => void;
};

export default function Environment({
  environmentId,
  setEnvironmentId,
}: Props): JSX.Element {
  const { environmentId: stateEnvironmentId, teamId } = useContext(
    StateContext
  );
  const { data } = useEnvironments(
    { team_id: teamId },
    { environmentId: stateEnvironmentId }
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEnvironmentId(e.target.value);
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
        value={environmentId}
        wrap
      />
    );
  } else if (environments) {
    environmentsHtml = (
      <RadioButtonGroup
        name="environment"
        onChange={handleChange}
        options={[{ label: copy.none, value: "" }]}
        value=""
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
