import { Box, BoxProps } from "grommet";
import { ReactNode } from "react";
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
      {children}
    </Box>
  );
}
