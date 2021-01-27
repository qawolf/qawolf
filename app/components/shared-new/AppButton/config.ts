import { BoxProps } from "grommet";
import { colors } from "../../../theme/theme-new";

export type Type = "danger" | "ghost" | "primary" | "secondary";

export const background: { [type in Type]: BoxProps["background"] } = {
  danger: colors.danger5,
  ghost: colors.gray0,
  primary: colors.primary5,
  secondary: colors.gray0,
};

export const hoverBackground: { [type in Type]: string } = {
  danger: colors.danger6,
  ghost: colors.gray2,
  primary: colors.primary6,
  secondary: colors.gray0,
};

export const textColor: { [type in Type]: string } = {
  danger: colors.gray0,
  ghost: colors.gray9,
  primary: colors.gray0,
  secondary: colors.gray9,
};
