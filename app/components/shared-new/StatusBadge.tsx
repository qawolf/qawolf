import { Box, BoxProps } from "grommet";

import { RunStatus } from "../../lib/types";
import { copy } from "../../theme/copy";
import { edgeSize } from "../../theme/theme-new";
import Text from "./Text";

type Props = {
  isSmall?: boolean;
  margin?: BoxProps["margin"];
  status?: RunStatus | null;
};

export default function StatusBadge({
  isSmall,
  margin,
  status,
}: Props): JSX.Element {
  if (!status) return null;

  let background = "gray3";
  let color = "gray7";
  let label = copy.testInProgress;

  if (status === "pass") {
    background = "success5";
    color = "gray0";
    label = copy.testPass;
  }

  if (status === "fail") {
    background = "danger5";
    color = "gray0";
    label = copy.testFail;
  }

  const textSize = isSmall ? "componentSmall" : "component";

  return (
    <Box
      background={background}
      flex={false}
      height={isSmall ? undefined : edgeSize.large}
      margin={margin}
      pad={{ horizontal: "xsmall", vertical: isSmall ? "xxxsmall" : undefined }}
      round="xlarge"
    >
      <Text color={color} size={textSize}>
        {label}
      </Text>
    </Box>
  );
}
