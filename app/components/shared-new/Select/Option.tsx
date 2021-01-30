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
  isSelected?: boolean;
  label: string;
  onClick: () => void;
};

const iconProps = {
  color: colors.gray9,
  size: edgeSize.small,
};

const StyledButton = styled(Button)`
  transition: background ${transitionDuration};

  &:hover {
    background: ${colors.gray2};
  }

  &:active {
    background: ${colors.gray3};
  }
`;

export default function Option({
  IconComponent: PropsIconComponent,
  isSelected,
  label,
  onClick,
}: Props): JSX.Element {
  const IconComponent = PropsIconComponent || (isSelected ? Check : undefined);

  return (
    <StyledButton onClick={onClick} plain>
      <Box
        align="center"
        direction="row"
        pad={{ right: "xsmall", left: "xxsmall", vertical: "xxsmall" }}
      >
        {!!IconComponent && <IconComponent {...iconProps} />}
        <Text
          color="gray9"
          margin={{
            left: IconComponent
              ? "xxsmall"
              : `calc(${edgeSize.small} + ${edgeSize.xxsmall})`,
          }}
          size="component"
          style={overflowStyle}
        >
          {label}
        </Text>
      </Box>
    </StyledButton>
  );
}
