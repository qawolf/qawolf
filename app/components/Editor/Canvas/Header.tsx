import { Box } from "grommet";

import { copy } from "../../../theme/copy";
import { colors, edgeSize } from "../../../theme/theme-new";
import { borderSize } from "../../../theme/theme-new";
import Browser from "../../shared-new/icons/Browser";
import Text from "../../shared-new/Text";
import CodeToggle from "./CodeToggle";

export default function Header(): JSX.Element {
  return (
    <Box
      align="center"
      border={{ color: "gray3", side: "bottom", size: borderSize.xsmall }}
      direction="row"
      flex={false}
      height={`calc(20px + (2 * ${edgeSize.small}))`} // height of code toggle
      justify="between"
      pad="small"
    >
      <CodeToggle />
      <Box align="center" direction="row">
        <Browser color={colors.gray9} size={edgeSize.small} />
        <Text color="gray9" margin={{ left: "xxsmall" }} size="component">
          {copy.browser}
        </Text>
      </Box>
    </Box>
  );
}
