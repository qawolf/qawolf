import { Box, BoxProps } from "grommet";
import { ReactNode } from "react";

import { copy } from "../../../theme/copy";
import Text from "../../shared/Text";

type Props = {
  children: ReactNode;
  label: string;
  pad?: BoxProps["pad"];
  step: number;
};

const width = "680px";

export default function Section({
  children,
  label,
  pad,
  step,
}: Props): JSX.Element {
  return (
    <Box alignSelf="center" flex={false} pad={pad || "xlarge"} width={width}>
      <Text color="gray6" size="eyebrowLarge">
        {copy.stepCount(step)}
      </Text>
      <Text
        color="gray9"
        margin={{ bottom: "small", top: "xxxsmall" }}
        size="componentHeaderLarge"
      >
        {label}
      </Text>
      {children}
    </Box>
  );
}
