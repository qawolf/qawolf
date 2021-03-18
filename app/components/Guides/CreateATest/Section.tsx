import { Box, BoxProps } from "grommet";
import { ReactNode } from "react";

import Text from "../../shared/Text";

type Props = {
  children: ReactNode;
  label: string;
  pad?: BoxProps["pad"];
};

const width = "680px";

export default function Section({ children, label, pad }: Props): JSX.Element {
  return (
    <Box alignSelf="center" flex={false} pad={pad || "xlarge"} width={width}>
      <Text color="gray9" margin={{ bottom: "xxsmall" }} size="componentXLarge">
        {label}
      </Text>
      {children}
    </Box>
  );
}
