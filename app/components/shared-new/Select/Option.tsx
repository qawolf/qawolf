import { Box, Button } from "grommet";
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
  className?: string;
  isSelected?: boolean;
  label: string;
  noIcon?: boolean;
  onClick: () => void;
  type?: "danger";
};

function Option({
  IconComponent: PropsIconComponent,
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
    <Button className={className} onClick={onClick} plain>
      <Box
        align="center"
        direction="row"
        pad={{ right: "xsmall", left: "xxsmall", vertical: "xxsmall" }}
      >
        {!!IconComponent && (
          <IconComponent color={color} size={edgeSize.small} />
        )}
        <Text
          color={color}
          margin={
            noIcon
              ? { left: "xxxsmall" }
              : {
                  left: IconComponent
                    ? "xxsmall"
                    : `calc(${edgeSize.small} + ${edgeSize.xxsmall})`,
                }
          }
          size="component"
          style={overflowStyle}
        >
          {label}
        </Text>
      </Box>
    </Button>
  );
}

const StyledOption = styled(Option)`
  transition: background ${transitionDuration};

  p {
    transition: color ${transitionDuration};
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
    `}
  }

  &:active {
    background: ${(props) =>
      props.type === "danger" ? colors.dangerDarker : colors.gray3};
  }
`;

export default StyledOption;
