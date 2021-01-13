import { Box } from "grommet";
import { CSSProperties } from "react";

import { Wolf as WolfType } from "../../../lib/types";
import WolfBlack from "./WolfBlack";
import WolfBlue from "./WolfBlue";
import WolfBrown from "./WolfBrown";
import WolfGray from "./WolfGray";
import WolfHusky from "./WolfHusky";
import WolfWhite from "./WolfWhite";

type Props = {
  animate?: boolean;
  containerStyle?: CSSProperties;
  style?: CSSProperties;
  wolf: WolfType;
};

const iconMapping: {
  [key: string]: (props: { id?: string; style?: CSSProperties }) => JSX.Element;
} = {
  black: WolfBlack,
  blue: WolfBlue,
  brown: WolfBrown,
  gray: WolfGray,
  husky: WolfHusky,
};

export default function Wolf({
  animate,
  containerStyle,
  style,
  wolf,
}: Props): JSX.Element {
  const WolfIcon = iconMapping[wolf.variant] || WolfWhite;

  const className = animate ? "animate" : undefined;

  return (
    <Box className={className} id="wolf" style={containerStyle}>
      <WolfIcon
        style={{
          display: "block",
          overflow: "visible",
          ...(style || {}),
        }}
      />
    </Box>
  );
}
