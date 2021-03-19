import { BoxProps, ButtonProps, TextProps } from "grommet";
import { Icon } from "grommet-icons";

import { Side } from "../../../lib/types";
import { borderSize, edgeSize } from "../../../theme/theme";
import { Type } from "./config";

type GetBoxPad = {
  hasIcon: boolean;
  hasLabel: boolean;
  iconPosition?: Side;
  isLarge?: boolean;
  justify?: BoxProps["justify"];
};

export type Props = {
  IconComponent?: Icon;
  a11yTitle?: string;
  className?: string;
  color?: string;
  hasError?: boolean;
  href?: string;
  hoverType?: Type;
  iconColor?: string;
  iconPosition?: Side;
  isDisabled?: boolean;
  isLarge?: boolean;
  isSelected?: boolean;
  justify?: BoxProps["justify"];
  label?: string;
  margin?: ButtonProps["margin"];
  noBorderSide?: Side;
  onClick?: () => void;
  openNewPage?: boolean;
  type: Type;
  width?: BoxProps["width"];
};

export const getBoxPad = ({
  hasIcon,
  hasLabel,
  iconPosition,
  isLarge,
  justify,
}: GetBoxPad): BoxProps["pad"] => {
  if (justify === "center") return undefined;

  const border = borderSize.xsmall;

  const defaultXSmallPad = isLarge ? edgeSize.small : edgeSize.xsmall;
  const defaultXXSmallPad = isLarge ? edgeSize.small : edgeSize.xxsmall;

  const xsmall = `calc(${defaultXSmallPad} - ${border})`;
  const xxsmall = `calc(${defaultXXSmallPad} - ${border})`;

  if (!hasLabel) return { horizontal: xxsmall };
  if (!hasIcon) return { horizontal: xsmall };

  return {
    left: iconPosition === "right" ? xsmall : xxsmall,
    right: iconPosition === "right" ? xxsmall : xsmall,
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

export const useDisabledStyle = ({ isDisabled, type }: Props): boolean => {
  if (type === "disabled") return true;

  return isDisabled && type === "primary";
};
