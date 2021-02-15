import { Box } from "grommet";
import { useContext } from "react";

import { useSuite } from "../../hooks/queries";
import { copy } from "../../theme/copy";
import { StateContext } from "../StateContext";
import Text from "./Text";

type Props = {
  suiteId?: string | null;
};

export default function TriggerBadge({ suiteId }: Props): JSX.Element {
  const { teamId, triggerId } = useContext(StateContext);

  const { data } = useSuite({ id: suiteId }, { teamId, triggerId });
  const name = data?.suite?.trigger_name;

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
