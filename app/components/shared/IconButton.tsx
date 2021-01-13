import { Box, BoxProps, Button } from "grommet";
import { Icon } from "grommet-icons";
import { CSSProperties, MouseEvent } from "react";
import { IconType } from "react-icons";

import { hoverTransition, iconSize } from "../../theme/theme";
import Text from "./Text";

type Props = {
  IconComponent: Icon | IconType;
  background?: BoxProps["background"];
  borderStyle?: "solid";
  className?: string;
  color: string;
  disabled?: boolean;
  elevation?: BoxProps["elevation"];
  href?: string;
  iconColor?: string;
  justify?: BoxProps["justify"];
  margin?: BoxProps["margin"];
  message: string;
  onClick?: (e: MouseEvent) => void;
  style?: CSSProperties;
  textMargin?: BoxProps["margin"];
};

export default function IconButton({
  IconComponent,
  background,
  borderStyle,
  className,
  color,
  disabled,
  elevation,
  href,
  iconColor,
  justify,
  margin,
  message,
  onClick,
  style,
  textMargin,
}: Props): JSX.Element {
  return (
    <Button
      a11yTitle={message}
      disabled={disabled}
      href={href}
      margin={margin}
      onClick={onClick}
      plain
      style={style}
    >
      <Box
        align="center"
        background={background}
        border={{ color, style: borderStyle || "dashed" }}
        className={className}
        direction="row"
        elevation={elevation}
        justify={justify}
        pad={{ horizontal: "medium", vertical: "small" }}
        round="small"
        style={{ transition: hoverTransition }}
      >
        <IconComponent
          color={iconColor || color}
          size={iconSize}
          style={{ transition: hoverTransition }}
        />
        <Text
          color={color}
          margin={textMargin || { left: "small" }}
          size="medium"
          style={{ transition: hoverTransition }}
        >
          {message}
        </Text>
      </Box>
    </Button>
  );
}
