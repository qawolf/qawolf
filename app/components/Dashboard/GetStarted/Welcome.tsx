import { Box } from "grommet";

import { copy } from "../../../theme/copy";
import Text from "../../shared/Text";
import { containerProps } from "./helpers";

export default function Welcome(): JSX.Element {
  return (
    <Box {...containerProps}>
      <Text color="gray9" size="componentXLarge">
        {copy.welcome}
      </Text>
    </Box>
  );
}
