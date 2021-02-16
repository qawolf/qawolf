import { Box, BoxProps } from "grommet";
import { ReactNode } from "react";

import { edgeSize } from "../../theme/theme-new";
import Text from "./Text";

type Props = {
  children: ReactNode;
  label: string;
  margin?: BoxProps["margin"];
};

export default function LabeledBox({
  children,
  label,
  margin,
}: Props): JSX.Element {
  return (
    <Box align="start" margin={margin}>
      <Text color="gray7" margin={{ bottom: "xxsmall" }} size="component">
        {label}
      </Text>
      <Box justify="center" style={{ minHeight: edgeSize.medium }}>
        {children}
      </Box>
    </Box>
  );
}
