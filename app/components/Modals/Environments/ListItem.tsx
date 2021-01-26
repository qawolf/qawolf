import { Box } from "grommet";
import { Environment } from "../../../lib/types";
import { overflowStyle } from "../../../theme/theme-new";

import Text from "../../shared-new/Text";

type Props = { environment: Environment };

export default function ListItem({ environment }: Props): JSX.Element {
  return (
    <Box flex={false}>
      <Text
        color="gray9"
        margin={{ vertical: "small" }}
        size="component"
        style={overflowStyle}
      >
        {environment.name}
      </Text>
    </Box>
  );
}
