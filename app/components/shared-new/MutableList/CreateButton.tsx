import { Box, Button } from "grommet";
import styled from "styled-components";

import { MutableListType } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { colors, edgeSize, transitionDuration } from "../../../theme/theme-new";
import Add from "../icons/Add";
import Text from "../Text";

type Props = {
  onClick: () => void;
  type: MutableListType;
};

const StyledButton = styled(Button)`
  p,
  svg {
    transition: all ${transitionDuration};
  }

  &:hover {
    p {
      color: ${colors.gray9};
    }

    svg {
      fill: ${colors.gray9};
    }
  }
`;

const color = colors.gray6;

export default function CreateButton({ onClick, type }: Props): JSX.Element {
  return (
    <StyledButton onClick={onClick} plain>
      <Box align="center" direction="row" flex={false} pad="xxsmall">
        <Add color={color} size={edgeSize.small} />
        <Text color={color} margin={{ left: "xxsmall" }} size="component">
          {copy[`${type}New`]}
        </Text>
      </Box>
    </StyledButton>
  );
}
