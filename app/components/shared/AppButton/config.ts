import { colors } from "../../../theme/theme";

export type Type =
  | "danger"
  | "dark"
  | "disabled"
  | "ghost"
  | "primary"
  | "secondary"
  | "snippet"
  | "success"
  | "tertiary";

export const activeBackground: { [type in Type]: string } = {
  danger: colors.danger7,
  dark: colors.gray10,
  disabled: colors.gray2,
  ghost: colors.gray3,
  primary: colors.primaryDarker,
  secondary: colors.gray0,
  snippet: colors.gray9,
  success: colors.success7,
  tertiary: colors.gray6,
};

export const activeBorderColor: { [type: string]: string } = {
  dark: colors.gray4,
  secondary: colors.gray9,
  snippet: colors.gray4,
};

export const activeSecondaryBackground: { [type: string]: string } = {
  danger: colors.danger6,
};

export const background: { [type in Type]: string } = {
  danger: colors.danger5,
  dark: colors.gray10,
  disabled: colors.gray2,
  ghost: colors.gray0,
  primary: colors.primary,
  secondary: colors.gray0,
  snippet: colors.gray9,
  success: colors.success5,
  tertiary: colors.gray8,
};

export const borderColor: { [type: string]: string } = {
  dark: colors.gray8,
  disabled: colors.gray3,
  secondary: colors.gray3,
  snippet: colors.gray8,
};

export const hoverBackground: { [type in Type]: string } = {
  danger: colors.danger6,
  dark: colors.gray10,
  disabled: colors.gray2,
  ghost: colors.gray2,
  primary: colors.primaryDark,
  secondary: colors.gray0,
  snippet: colors.gray9,
  success: colors.success6,
  tertiary: colors.gray7,
};

export const hoverBorderColor: { [type: string]: string } = {
  dark: colors.gray6,
  secondary: colors.gray6,
  snippet: colors.gray6,
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
  snippet: colors.gray0,
  success: colors.gray0,
  tertiary: colors.gray0,
};
