import { Box, Button } from "grommet";
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
  isSelected?: boolean;
  label: string;
  onClick: () => void;
};

const StyledBox = styled(Box)`
  transition: background ${transitionDuration};

  &:hover {
    background: ${colors.gray2};
  }
`;

export default function Option({
  isSelected,
  label,
  onClick,
}: Props): JSX.Element {
  return (
    <Button onClick={onClick} plain>
      <StyledBox
        align="center"
        direction="row"
        pad={{ right: "xsmall", left: "xxsmall", vertical: "xxsmall" }}
      >
        {!!isSelected && <Check color={colors.gray9} size={edgeSize.small} />}
        <Text
          color="gray9"
          margin={{
            left: isSelected
              ? "xxsmall"
              : `calc(${edgeSize.small} + ${edgeSize.xxsmall})`,
          }}
          size="component"
          style={overflowStyle}
        >
          {label}
        </Text>
      </StyledBox>
    </Button>
  );
}
