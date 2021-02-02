import { Box, BoxProps } from "grommet";
import { RunStatus } from "../../lib/types";
import { copy } from "../../theme/copy";
import Text from "./Text";

type Props = {
  margin?: BoxProps["margin"];
  status?: RunStatus | null;
};

export default function StatusBadge({ margin, status }: Props): JSX.Element {
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

  return (
    <Box
      background={background}
      margin={margin}
      pad={{ horizontal: "xsmall", vertical: "xxxsmall" }}
      round="xlarge"
    >
      <Text color={color} size="component">
        {label}
      </Text>
    </Box>
  );
}
