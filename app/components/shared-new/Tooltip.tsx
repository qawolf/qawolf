import { Box, Drop, DropProps } from "grommet";

import { borderSize } from "../../theme/theme-new";
import Text from "./Text";

type Props = {
  isVisible: boolean;
  label: string;
  target: DropProps["target"];
};

export default function Tooltip({
  isVisible,
  label,
  target,
}: Props): JSX.Element {
  if (!isVisible) return null;

  return (
    <Drop
      align={{ bottom: "top" }}
      plain
      style={{ marginBottom: "xxsmall" }}
      target={target}
    >
      <Box
        background="gray9"
        pad={{ horizontal: "xxsmall", vertical: "xxxsmall" }}
        round={borderSize.small}
      >
        <Text color="gray0" size="componentSmall">
          {label}
        </Text>
      </Box>
    </Drop>
  );
}
