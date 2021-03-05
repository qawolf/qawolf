import { Box } from "grommet";

import { borderSize, edgeSize, transition } from "../../../theme/theme-new";

type Props = { isChecked: boolean };

const size = edgeSize.xxsmall;

export default function Radio({ isChecked }: Props): JSX.Element {
  return (
    <Box
      border={{
        color: isChecked ? "primary" : "gray4",
        size: borderSize.xsmall,
      }}
      margin={{ right: "small" }}
      round="full"
      style={{ transition }}
    >
      <Box
        background={isChecked ? "primary" : "transparent"}
        height={size}
        margin={borderSize.small}
        round="full"
        style={{ transition }}
        width={size}
      />
    </Box>
  );
}
