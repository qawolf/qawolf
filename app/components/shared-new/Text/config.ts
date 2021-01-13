import { TextProps } from "grommet";

import { colors } from "../../../theme/theme-new";

export type Size =
  | "xxsmall"
  | "xsmall"
  | "small"
  | "medium"
  | "large"
  | "xlarge"
  | "xxlarge"
  | "eyebrow";

export type Weight = "bold" | "medium" | "normal";

export const defaultTag: { [size in Size]: TextProps["as"] } = {
  xxsmall: "p",
  xsmall: "p",
  small: "h5",
  medium: "h4",
  large: "h3",
  xlarge: "h2",
  xxlarge: "h1",
  eyebrow: "h2",
};

export const hoverColor = {
  primaryFill: colors.primaryHover,
  textDark: colors.textLight,
  textLight: colors.textDark,
  white: colors.primaryTextLight,
};
