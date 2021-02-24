import { Box } from "grommet";

import { borderSize } from "../../../theme/theme-new";
import Header from "./Header";
import Wolf from "./Wolf";

const width = "280px";

export default function Sidebar(): JSX.Element {
  return (
    <Box
      border={{ color: "gray3", side: "right", size: borderSize.xsmall }}
      height="full"
      flex={false}
      justify="between"
      pad={{ top: "medium" }}
      width={width}
    >
      <Header />
      <Wolf />
    </Box>
  );
}
