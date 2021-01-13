import { Box, BoxProps } from "grommet";

import { getBackgroundForStatus } from "../../../lib/colors";
import { RunStatus } from "../../../lib/types";
import { edgeSize } from "../../../theme/theme";
import { getIconForStatus } from "./utils";

type Props = {
  margin?: BoxProps["margin"];
  status: RunStatus;
};

export default function StatusIcon({ margin, status }: Props): JSX.Element {
  const { background, borderColor } = getBackgroundForStatus(status);
  const IconComponent = getIconForStatus(status);

  return (
    <Box
      align="center"
      background={borderColor}
      direction="row"
      height={edgeSize.xxlarge}
      margin={margin}
      justify="center"
      round="full"
      width={edgeSize.xxlarge}
    >
      <IconComponent color={background} />
    </Box>
  );
}
