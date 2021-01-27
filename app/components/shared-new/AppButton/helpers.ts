import { BoxProps, TextProps } from "grommet";

import { Side } from "../../../lib/types";

export const getBoxPad = (
  hasLabel: boolean,
  hasIcon: boolean,
  iconPosition: Side = "left"
): BoxProps["pad"] => {
  if (!hasLabel) return { horizontal: "xxsmall" };
  if (!hasIcon) return { horizontal: "xsmall" };

  return {
    left: iconPosition === "left" ? "xxsmall" : "xsmall",
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
