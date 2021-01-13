import { BoxProps } from "grommet";

import { edgeSize } from "../../../theme/theme-new";
import { Size as TextSize } from "../Text/config";

export type Size = "small" | "medium" | "large";
export type Type =
  | "invisibleDark"
  | "invisibleLight"
  | "outlineDark"
  | "outlineLight"
  | "primary";

export const background: { [type in Type]: BoxProps["background"] } = {
  invisibleDark: "transparent",
  invisibleLight: "transparent",
  primary: "primaryFill",
  outlineDark: "transparent",
  outlineLight: "transparent",
};

export const height: { [size in Size]: string } = {
  small: edgeSize.large,
  medium: "48px",
  large: "56px",
};

export const heightDesktop: { [size in Size]: string } = {
  small: edgeSize.large,
  medium: "56px",
  large: edgeSize.xxxlarge,
};

export const pad: { [size in Size]: BoxProps["pad"] } = {
  small: "xsmall",
  medium: "small",
  large: "medium",
};

export const round: { [size in Size]: BoxProps["round"] } = {
  small: "xxxsmall",
  medium: "xxsmall",
  large: "xsmall",
};

export const textSize: { [size in Size]: TextSize } = {
  small: "xxsmall",
  medium: "xsmall",
  large: "small",
};
