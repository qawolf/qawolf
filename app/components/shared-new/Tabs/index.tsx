import { Box, BoxProps } from "grommet";

import { NavigationType } from "../../../lib/types";
import { borderSize } from "../../../theme/theme-new";

type Props = {
  children: JSX.Element[];
  pad?: BoxProps["pad"];
  type?: NavigationType;
};

export default function Tabs({ children, pad, type }: Props): JSX.Element {
  const borderColor = type === "light" ? "gray3" : "gray9";

  return (
    <Box
      border={{ color: borderColor, side: "bottom", size: borderSize.xsmall }}
      direction="row"
      gap="small"
      pad={pad}
    >
      {children}
    </Box>
  );
}
