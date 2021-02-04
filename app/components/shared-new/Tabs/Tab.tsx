import { Box, Button } from "grommet";
import styled from "styled-components";

import {
  borderSize,
  colors,
  edgeSize,
  transitionDuration,
} from "../../../theme/theme-new";
import Text from "../Text";

type Props = {
  isSelected: boolean;
  label: string;
  onClick: () => void;
};

const StyledButton = styled(Button)`
  // slight overlap with tabs container border
  margin-bottom: -${borderSize.xsmall};

  p {
    transition: color ${transitionDuration};
  }

  &:hover {
    p {
      color: ${colors.gray3};
    }
  }

  &:active {
    p {
      color: ${colors.gray0};
    }
  }
`;

const borderHeight = `calc(${borderSize.small} + ${borderSize.xsmall})`;

export default function Tab({
  isSelected,
  label,
  onClick,
}: Props): JSX.Element {
  return (
    <StyledButton a11yTitle={label} onClick={onClick} plain>
      <Box pad={{ top: "small" }}>
        <Text color={isSelected ? "gray0" : "gray5"} size="component">
          {label}
        </Text>
        <Box
          background={isSelected ? "primary" : "transparent"}
          height={borderHeight}
          margin={{ top: `calc(${edgeSize.small} - ${borderSize.small})` }}
        />
      </Box>
    </StyledButton>
  );
}
