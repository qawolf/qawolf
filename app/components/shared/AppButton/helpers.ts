import { BoxProps, TextProps } from "grommet";

import { Side } from "../../../lib/types";
import { borderSize, edgeSize } from "../../../theme/theme";
import { Type } from "./config";

type GetBoxPad = {
  hasIcon: boolean;
  hasLabel: boolean;
  iconPosition?: Side;
  isLarge?: boolean;
  justify?: BoxProps["justify"];
  type: Type;
};

export const getBoxPad = ({
  hasIcon,
  hasLabel,
  iconPosition,
  isLarge,
  justify,
  type,
}: GetBoxPad): BoxProps["pad"] => {
  if (justify === "center") return undefined;

  const hasBorder = ["dark", "disabled", "secondary"].includes(type);
  const border = borderSize.xsmall;
  const defaultPad = isLarge ? edgeSize.small : edgeSize.xsmall;

  const xsmall = hasBorder ? `calc(${defaultPad} - ${border})` : defaultPad;
  const xxsmall = hasBorder ? `calc(${defaultPad} - ${border})` : defaultPad;

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
