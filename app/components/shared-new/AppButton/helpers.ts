import { BoxProps, TextProps } from "grommet";

import { Side } from "../../../lib/types";

type GetBoxPad = {
  hasIcon: boolean;
  hasLabel: boolean;
  iconPosition?: Side;
  justify?: BoxProps["justify"];
};

export const getBoxPad = ({
  hasIcon,
  hasLabel,
  iconPosition,
  justify,
}: GetBoxPad): BoxProps["pad"] => {
  if (justify === "center") return undefined;

  if (!hasLabel) return { horizontal: "xxsmall" };
  if (!hasIcon) return { horizontal: "xsmall" };

  return {
    left: iconPosition === "right" ? "xsmall" : "xxsmall",
    right: iconPosition === "right" ? "xxsmall" : "xsmall",
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
