import { Box } from "grommet";

import { copy } from "../../../../theme/copy";
import { borderSize } from "../../../../theme/theme-new";
import Text from "../../../shared-new/Text";
import Buttons from "./Buttons";

export default function Header(): JSX.Element {
  return (
    <Box
      align="center"
      border={{ color: "gray3", side: "bottom", size: borderSize.xsmall }}
      direction="row"
      justify="between"
      pad="medium"
    >
      <Box align="center" direction="row">
        <Text color="gray9" size="componentHeader">
          {copy.allTests}
        </Text>
      </Box>
      <Buttons />
    </Box>
  );
}
