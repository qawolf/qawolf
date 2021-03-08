import { Box, Drop, DropProps } from "grommet";

import { borderSize, edgeSize } from "../../theme/theme";
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
      style={{ marginBottom: edgeSize.xxsmall }}
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
