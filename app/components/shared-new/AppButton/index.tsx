import { Box, BoxProps, Button, ButtonProps } from "grommet";
import { Icon } from "grommet-icons";
import styled from "styled-components";

import {
  borderSize,
  colors,
  edgeSize,
  transitionDuration,
} from "../../../theme/theme-new";
import Text from "../Text";
import { background, hoverBackground, textColor, Type } from "./config";
import { IconPosition, getTextMargin, getBoxPad } from "./helpers";

type Props = {
  IconComponent?: Icon;
  a11yTitle?: string;
  className?: string;
  hoverType?: Type;
  iconPosition?: IconPosition;
  isDisabled?: boolean;
  label?: string;
  margin?: ButtonProps["margin"];
  onClick: () => void;
  type: Type;
  width?: BoxProps["width"];
};

function AppButton({
  IconComponent,
  a11yTitle,
  className,
  iconPosition,
  isDisabled,
  label,
  margin,
  onClick,
  type,
  width,
}: Props): JSX.Element {
  return (
    <Button
      a11yTitle={a11yTitle || label}
      disabled={isDisabled}
      margin={margin}
      onClick={onClick}
      plain
    >
      <Box
        align="center"
        background={background[type]}
        className={className}
        direction={iconPosition === "right" ? "row-reverse" : "row"}
        justify="between"
        pad={getBoxPad(!!label, !!IconComponent, iconPosition)}
        round={borderSize.small}
        width={width}
      >
        {!!IconComponent && (
          <IconComponent color={textColor[type]} size={edgeSize.small} />
        )}
        {!!label && (
          <Text
            color={textColor[type]}
            margin={getTextMargin(!!IconComponent, iconPosition)}
            size="component"
          >
            {label}
          </Text>
        )}
      </Box>
    </Button>
  );
}

const StyledAppButton = styled(AppButton)`
  height: ${edgeSize.large};
  transition: all ${transitionDuration};

  ${(props) =>
    props.type === "dark" &&
    `
  border: ${borderSize.xsmall} solid ${colors.gray8};
  `}

  ${(props) =>
    props.type === "secondary" &&
    `
  border: ${borderSize.xsmall} solid ${colors.gray3};
  `}

  svg {
    transition: fill ${transitionDuration};
  }

  &:hover {
    ${(props) =>
      `
    background: ${
      hoverBackground[props.hoverType] || hoverBackground[props.type]
    };

    svg {
      fill: ${textColor[props.hoverType] || textColor[props.type]};
    }
    `}

    ${(props) => props.type === "dark" && `border-color: ${colors.gray6};`}
    ${(props) => props.type === "secondary" && `border-color: ${colors.gray5};`}
  }
`;

export default StyledAppButton;
