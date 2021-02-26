import { Box, Button, ButtonProps } from "grommet";
import { Icon } from "grommet-icons";
import styled from "styled-components";

import {
  colors,
  edgeSize,
  overflowStyle,
  transitionDuration,
} from "../../../theme/theme-new";
import Check from "../icons/Check";
import Text from "../Text";

type Props = {
  IconComponent?: Icon;
  a11yTitle?: ButtonProps["a11yTitle"];
  className?: string;
  isSelected?: boolean;
  label: JSX.Element | string;
  noIcon?: boolean;
  onClick?: () => void;
  type?: "danger";
};

function Option({
  IconComponent: PropsIconComponent,
  a11yTitle,
  className,
  isSelected,
  label,
  noIcon,
  onClick,
  type,
}: Props): JSX.Element {
  const IconComponent = PropsIconComponent || (isSelected ? Check : undefined);

  const color = type === "danger" ? colors.danger5 : colors.gray9;

  return (
    <Button a11yTitle={a11yTitle} className={className} onClick={onClick} plain>
      <Box
        align="center"
        direction="row"
        pad={{ right: "xsmall", left: "xxsmall", vertical: "xxsmall" }}
      >
        {!!IconComponent && (
          <IconComponent color={color} size={edgeSize.small} />
        )}
        <Box
          align="center"
          direction="row"
          margin={
            noIcon
              ? { left: "xxxsmall" }
              : {
                  left: IconComponent
                    ? "xxsmall"
                    : `calc(${edgeSize.small} + ${edgeSize.xxsmall})`,
                }
          }
          width="full"
        >
          {typeof label === "string" ? (
            <Text color={color} size="component" style={overflowStyle}>
              {label}
            </Text>
          ) : (
            label
          )}
        </Box>
      </Box>
    </Button>
  );
}

const StyledOption = styled(Option)`
  transition: background ${transitionDuration};

  p {
    transition: color ${transitionDuration};
  }

  svg {
    transition: all ${transitionDuration};
  }

  &:hover {
    background: ${(props) =>
      props.type === "danger" ? colors.danger5 : colors.gray2};

    ${(props) =>
      props.type === "danger" &&
      `
      p {
        color: ${colors.gray0};
      }

      svg {
        fill: ${colors.gray0};
        stroke: ${colors.gray0};
      }
    `}
  }

  &:active {
    background: ${(props) =>
      props.type === "danger" ? colors.danger6 : colors.gray3};
  }
`;

export default StyledOption;
