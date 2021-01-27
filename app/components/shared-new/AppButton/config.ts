import { BoxProps } from "grommet";

export type Type = "danger" | "ghost";

export const background: { [type in Type]: BoxProps["background"] } = {
  danger: "danger5",
  ghost: "transparent",
};

export const hoverBackground: { [type in Type]: string } = {
  danger: "danger6",
  ghost: "gray2",
};

export const hoverIconColor: { [type in Type]: string } = {
  danger: "gray0",
  ghost: "gray9",
};
