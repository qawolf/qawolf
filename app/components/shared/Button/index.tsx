import classNames from "classnames";
import {
  Box,
  BoxProps,
  Button as GrommetButton,
  ButtonProps,
  TextProps,
} from "grommet";
import { Icon } from "grommet-icons";
import { CSSProperties } from "react";
import { IconType } from "react-icons";

import {
  colors,
  edgeSize,
  hoverTransition,
  lineHeight,
} from "../../../theme/theme";
import Text from "../Text";
import styles from "./Button.module.css";

type Props = {
  IconComponent?: Icon | IconType | null;
  dataTest?: string;
  disabled?: boolean;
  fill?: ButtonProps["fill"];
  href?: string;
  isSecondary?: boolean;
  margin?: BoxProps["margin"];
  message: string | null;
  noBorder?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
  textSize?: TextProps["size"];
  width?: BoxProps["width"];
};

export default function Button({
  IconComponent,
  dataTest,
  disabled,
  fill,
  href,
  isSecondary,
  margin,
  message,
  noBorder,
  onClick,
  style,
  textSize,
  width,
}: Props): JSX.Element {
  const background = isSecondary ? "transparent" : "brand";
  const borderColor = isSecondary ? "black" : "brand";

  return (
    <GrommetButton
      a11yTitle={message || "button"}
      data-test={dataTest}
      disabled={disabled}
      fill={fill}
      href={href}
      margin={margin}
      onClick={onClick}
      plain
    >
      <Box
        align="center"
        background={background}
        border={{ color: noBorder ? "transparent" : borderColor }}
        className={classNames({
          [styles.defaultButton]: !isSecondary,
          [styles.secondaryButton]: isSecondary,
        })}
        direction="row"
        justify="center"
        pad={{ horizontal: "medium", vertical: "small" }}
        round="small"
        style={{
          ...(style || {}),
          transition: hoverTransition,
          whiteSpace: "nowrap",
        }}
        width={width}
      >
        {!!IconComponent && (
          <IconComponent
            color={colors.black}
            size={lineHeight.medium}
            style={{
              marginRight: message ? edgeSize.small : undefined,
              transition: hoverTransition,
            }}
          />
        )}
        {!!message && (
          <Text
            color="black"
            size={textSize || "medium"}
            style={{ transition: hoverTransition }}
            weight="bold"
          >
            {message}
          </Text>
        )}
      </Box>
    </GrommetButton>
  );
}
