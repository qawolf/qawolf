import { Box } from "grommet";

import { edgeSize } from "../../../theme/theme";
import { borderSize } from "../../../theme/theme";
import CodeToggle from "./CodeToggle";

export default function Header(): JSX.Element {
  return (
    <Box
      border={{ color: "gray3", side: "bottom", size: borderSize.xsmall }}
      flex={false}
      height={`calc(20px + (2 * ${edgeSize.small}))`} // height of code toggle
      justify="center"
      pad="small"
    >
      <CodeToggle />
    </Box>
  );
}
