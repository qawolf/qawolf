import { Box, Button, ButtonProps } from "grommet";
import { Icon } from "grommet-icons";
import styled from "styled-components";
import {
  borderSize,
  colors,
  edgeSize,
  fontFamily,
  fontWeight,
  transitionDuration,
} from "../../../theme/theme-new";
import { Type, background, hoverBackground, textColor } from "./config";
import Text from "../Text";

type Props = {
  IconComponent?: Icon;
  a11yTitle?: string;
  className?: string;
  hoverType?: Type;
  isDisabled?: boolean;
  label?: string;
  margin?: ButtonProps["margin"];
  onClick: () => void;
  type: Type;
};

function AppButton({
  IconComponent,
  a11yTitle,
  className,
  isDisabled,
  label,
  margin,
  onClick,
  type,
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
        direction="row"
        pad={{
          left: IconComponent && label ? "xxsmall" : "xsmall",
          right: "xsmall",
        }}
        round={borderSize.small}
      >
        {!!IconComponent && (
          <IconComponent color={textColor[type]} size={edgeSize.small} />
        )}
        {!!label && (
          <Text
            color={textColor[type]}
            margin={IconComponent ? { left: "xxsmall" } : undefined}
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

    ${(props) => props.type === "secondary" && `border-color: ${colors.gray5};`}
  }
`;

export default StyledAppButton;
