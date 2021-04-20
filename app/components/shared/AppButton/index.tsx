import { Box, Button } from "grommet";
import Link from "next/link";
import styled from "styled-components";

import {
  borderSize,
  colors,
  edgeSize,
  overflowStyle,
  transition,
  transitionDuration,
} from "../../../theme/theme";
import Text from "../Text";
import {
  activeBackground,
  activeBorderColor,
  activeSecondaryBackground,
  background,
  borderColor,
  hoverBackground,
  hoverBorderColor,
  hoverSecondaryBackground,
  textColor,
} from "./config";
import { getBoxPad, getTextMargin, Props, useDisabledStyle } from "./helpers";

function AppButton(props: Props): JSX.Element {
  const {
    IconComponent,
    a11yTitle,
    className,
    color,
    href,
    iconColor,
    iconPosition,
    isDisabled,
    isLarge,
    justify,
    label,
    margin,
    onClick,
    openNewPage,
    type,
  } = props;

  const finalA11yTitle =
    a11yTitle || (typeof label === "string" ? (label as string) : "button");
  const finalType = useDisabledStyle(props) ? "disabled" : type;

  const innerHtml = (
    <Button
      a11yTitle={finalA11yTitle}
      className={className}
      disabled={isDisabled}
      margin={margin}
      onClick={onClick}
      plain
      style={{ transition }}
    >
      <Box
        align="center"
        direction={iconPosition === "right" ? "row-reverse" : "row"}
        fill
        justify={justify || "between"}
        pad={getBoxPad({
          hasIcon: !!IconComponent,
          hasLabel: !!label,
          iconPosition,
          isLarge,
          justify,
        })}
      >
        {!!IconComponent && (
          <IconComponent
            color={iconColor || color || textColor[finalType]}
            size={edgeSize.small}
          />
        )}
        {!!label && typeof label === "string" ? (
          <Text
            color={color || textColor[finalType]}
            margin={getTextMargin(!!IconComponent, iconPosition)}
            size={isLarge ? "buttonLarge" : "component"}
            style={overflowStyle}
          >
            {label}
          </Text>
        ) : (
          label
        )}
      </Box>
    </Button>
  );

  if (href) {
    return (
      <Link href={href}>
        <a target={openNewPage ? "_blank" : undefined}>{innerHtml}</a>
      </Link>
    );
  }

  return innerHtml;
}

const StyledAppButton = styled(AppButton)`
  background: ${(props) =>
    `${background[useDisabledStyle(props) ? "disabled" : props.type]}`};
  border-radius: ${(props) =>
    props.isLarge ? borderSize.medium : borderSize.small};
  height: ${(props) => (props.isLarge ? edgeSize.xxlarge : edgeSize.large)};

  ${(props) => !!props.isDisabled && "cursor: not-allowed;"}
  ${(props) => !!props.width && `width: ${props.width};`}
  border: 1px solid ${(props) =>
    useDisabledStyle(props)
      ? borderColor.disabled
      : borderColor[props.type] || background[props.type]};

  ${(props) =>
    !!props.noBorderSide &&
    `
  border-${props.noBorderSide}: none;
  border-bottom-${props.noBorderSide}-radius: 0;
  border-top-${props.noBorderSide}-radius: 0;
  `}

  ${(props) => !!props.hasError && `border-color: ${colors.danger5};`}
  ${(props) => !!props.isSelected && `border-color: ${colors.gray9};`}

  svg {
    transition: fill ${transitionDuration};
  }

  &:hover {
    ${(props) =>
      !props.isDisabled &&
      `
    background: ${
      hoverSecondaryBackground[props.hoverType] || hoverBackground[props.type]
    };

    border-color: ${
      hoverBorderColor[props.type] ||
      hoverSecondaryBackground[props.hoverType] ||
      hoverBackground[props.type]
    };

    p, 
    svg {
      color: ${textColor[props.hoverType || props.type]};
      fill: ${textColor[props.hoverType || props.type]};
    }
    `}
  }

  &:active {
    ${(props) =>
      !props.isDisabled &&
      `
    background: ${
      activeSecondaryBackground[props.hoverType] || activeBackground[props.type]
    };

    border-color: ${
      activeBorderColor[props.type] ||
      activeSecondaryBackground[props.hoverType] ||
      activeBackground[props.type]
    };
    `}
  }

  ${(props) =>
    props.isDisabled &&
    !useDisabledStyle(props) &&
    `
    opacity: 0.4;
  `}
`;

export default StyledAppButton;
