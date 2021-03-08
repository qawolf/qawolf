import { BoxProps, TextProps } from "grommet";

import { Side } from "../../../lib/types";
import { borderSize, edgeSize } from "../../../theme/theme-new";
import { Type } from "./config";

type GetBoxPad = {
  hasIcon: boolean;
  hasLabel: boolean;
  iconPosition?: Side;
  justify?: BoxProps["justify"];
  type: Type;
};

export const getBoxPad = ({
  hasIcon,
  hasLabel,
  iconPosition,
  justify,
  type,
}: GetBoxPad): BoxProps["pad"] => {
  if (justify === "center") return undefined;

  const hasBorder = ["dark", "secondary"].includes(type);
  const border = borderSize.xsmall;

  const xsmall = hasBorder ? `calc(${edgeSize.xsmall} - ${border})` : "xsmall";
  const xxsmall = hasBorder
    ? `calc(${edgeSize.xxsmall} - ${border})`
    : "xxsmall";

  if (!hasLabel) return { horizontal: xxsmall };
  if (!hasIcon) return { horizontal: xsmall };

  return {
    left: iconPosition === "right" ? xsmall : xxsmall,
    right: iconPosition === "right" ? xxsmall : xsmall,
  };
};

export const getTextMargin = (
  hasIcon: boolean,
  iconPosition: Side = "left"
): TextProps["margin"] => {
  if (!hasIcon) return undefined;

  if (iconPosition === "left") return { left: "xxsmall" };
  return { right: "xxsmall" };
};
