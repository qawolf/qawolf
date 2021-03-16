import { Box, Drop, DropProps } from "grommet";
import { CSSProperties } from "react";

import { borderSize, edgeSize } from "../../theme/theme";
import Text from "./Text";

type Props = {
  align?: DropProps["align"];
  isVisible: boolean;
  label: string;
  target: DropProps["target"];
  style?: CSSProperties;
};

export default function Tooltip({
  align,
  isVisible,
  label,
  target,
  style,
}: Props): JSX.Element {
  if (!isVisible) return null;

  return (
    <Drop
      align={align || { bottom: "top" }}
      plain
      style={style || { marginBottom: edgeSize.xxsmall }}
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
