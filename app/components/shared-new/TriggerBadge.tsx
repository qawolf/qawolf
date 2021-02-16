import { Box } from "grommet";
import { useContext, useEffect } from "react";

import { useSuite } from "../../hooks/queries";
import { state } from "../../lib/state";
import { copy } from "../../theme/copy";
import { StateContext } from "../StateContext";
import Text from "./Text";

type Props = {
  suiteId?: string | null;
};

export default function TriggerBadge({ suiteId }: Props): JSX.Element {
  const { environmentId, teamId, triggerId } = useContext(StateContext);

  const { data } = useSuite({ id: suiteId }, { teamId, triggerId });
  const name = data?.suite?.trigger_name;

  // tee up correct environment if test edited
  useEffect(() => {
    if (
      !data?.suite?.environment_id ||
      data.suite.environment_id === environmentId
    ) {
      return;
    }

    state.setEnvironmentId(data.suite.environment_id);
  }, [data?.suite?.environment_id, environmentId]);

  return (
    <Box
      background="gray2"
      pad={{ horizontal: "xsmall", vertical: "xxxsmall" }}
      round="xlarge"
    >
      <Text color="gray9" size="component">
        {name || copy.loading}
      </Text>
    </Box>
  );
}
