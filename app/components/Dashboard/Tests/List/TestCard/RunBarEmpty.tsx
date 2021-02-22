import { Box } from "grommet";

import { borderSize, edgeSize } from "../../../../../theme/theme-new";

export const boxProps = {
  height: edgeSize.medium,
  round: "xlarge",
  width: edgeSize.xxsmall,
};

export default function RunBarEmpty(): JSX.Element {
  return (
    <Box
      {...boxProps}
      background="gray1"
      border={{ color: "gray3", size: borderSize.xsmall }}
    />
  );
}
