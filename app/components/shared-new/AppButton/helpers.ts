import { BoxProps, TextProps } from "grommet";

export type IconPosition = "left" | "right";

export const getBoxPad = (
  hasLabel: boolean,
  hasIcon: boolean,
  iconPosition: IconPosition = "left"
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
  iconPosition: IconPosition = "left"
): TextProps["margin"] => {
  if (!hasIcon) return undefined;

  if (iconPosition === "left") return { left: "xxsmall" };
  return { right: "xxsmall" };
};
