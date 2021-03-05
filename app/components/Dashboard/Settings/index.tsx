import { Box } from "grommet";

import { copy } from "../../../theme/copy";
import { border, edgeSize } from "../../../theme/theme-new";
import Text from "../../shared-new/Text";

const maxWidth = "640px";

export default function Settings(): JSX.Element {
  return (
    <Box width="full">
      <Box border={{ ...border, side: "bottom" }} justify="center" pad="medium">
        <Box height={edgeSize.large} justify="center">
          <Text color="gray9" size="componentHeader">
            {copy.settings}
          </Text>
        </Box>
      </Box>
      <Box pad="medium" style={{ maxWidth }}></Box>
    </Box>
  );
}
