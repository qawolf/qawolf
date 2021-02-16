import { Box } from "grommet";

import { copy } from "../../theme/copy";
import Text from "./Text";

type Props = {
  isLoading?: boolean;
  name?: string | null;
};

export default function TriggerBadge({ isLoading, name }: Props): JSX.Element {
  if (!isLoading && !name) return null;

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
