import { Box } from "grommet";

import { copy } from "../../theme/copy";
import Text from "../shared/Text";

export default function NoMobile(): JSX.Element {
  return (
    <Box>
      <Text
        color="gray9"
        margin={{ top: "64px" }}
        size="componentHeader"
        textAlign="center"
      >
        {copy.noMobile}
      </Text>
    </Box>
  );
}
