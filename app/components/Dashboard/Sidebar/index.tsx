import { Box } from "grommet";

import { borderSize } from "../../../theme/theme-new";
import Header from "./Header";

const width = "280px";

export default function Sidebar(): JSX.Element {
  return (
    <Box
      border={{ color: "gray3", side: "right", size: borderSize.xsmall }}
      height="full"
      pad="medium"
      width={width}
    >
      <Header />
    </Box>
  );
}
