import { TextProps } from "grommet";

import { colors } from "../../../theme/theme";

export type Size =
  | "xxsmall"
  | "xsmall"
  | "small"
  | "medium"
  | "large"
  | "xlarge"
  | "xxlarge"
  | "buttonLarge"
  | "component"
  | "componentBold"
  | "componentHeader"
  | "componentHeaderLarge"
  | "componentLarge"
  | "componentMedium"
  | "componentParagraph"
  | "componentParagraphLarge"
  | "componentSmall"
  | "componentXLarge"
  | "eyebrow"
  | "eyebrowLarge";

export type Weight = "bold" | "medium" | "normal";

export const defaultTag: { [size in Size]: TextProps["as"] } = {
  xxsmall: "p",
  xsmall: "p",
  small: "h5",
  medium: "h4",
  large: "h3",
  xlarge: "h2",
  xxlarge: "h1",
  buttonLarge: "p",
  component: "p",
  componentBold: "p",
  componentHeader: "h1",
  componentHeaderLarge: "h1",
  componentLarge: "h2",
  componentMedium: "p",
  componentParagraph: "p",
  componentParagraphLarge: "p",
  componentSmall: "p",
  componentXLarge: "h1",
  eyebrow: "h2",
  eyebrowLarge: "h2",
};

export const hoverColor = {
  primaryFill: colors.primaryHover,
  textDark: colors.textLight,
  textLight: colors.textDark,
  white: colors.primaryTextLight,
};
