import { BoxProps } from "grommet";

import { colors } from "../../../theme/theme";

export type Type =
  | "danger"
  | "dark"
  | "disabled"
  | "ghost"
  | "primary"
  | "secondary"
  | "success"
  | "tertiary";

export const activeBackground: { [type in Type]: BoxProps["background"] } = {
  danger: colors.danger7,
  dark: colors.gray10,
  disabled: colors.gray2,
  ghost: colors.gray3,
  primary: colors.primaryDarker,
  secondary: colors.gray0,
  success: colors.success7,
  tertiary: colors.gray6,
};

export const activeSecondaryBackground: { [type: string]: string } = {
  danger: colors.danger6,
};

export const background: { [type in Type]: BoxProps["background"] } = {
  danger: colors.danger5,
  dark: colors.gray10,
  disabled: colors.gray2,
  ghost: colors.gray0,
  primary: colors.primary,
  secondary: colors.gray0,
  success: colors.success5,
  tertiary: colors.gray8,
};

export const hoverBackground: { [type in Type]: string } = {
  danger: colors.danger6,
  dark: colors.gray10,
  disabled: colors.gray2,
  ghost: colors.gray2,
  primary: colors.primaryDark,
  secondary: colors.gray0,
  success: colors.success6,
  tertiary: colors.gray7,
};

export const hoverSecondaryBackground: { [type: string]: string } = {
  danger: colors.danger5,
};

export const textColor: { [type in Type]: string } = {
  danger: colors.gray0,
  dark: colors.gray0,
  disabled: colors.gray6,
  ghost: colors.gray9,
  primary: colors.gray0,
  secondary: colors.gray9,
  success: colors.gray0,
  tertiary: colors.gray0,
};
