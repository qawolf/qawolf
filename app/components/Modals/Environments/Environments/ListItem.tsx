import { Box, Button } from "grommet";
import styled from "styled-components";
import { Environment } from "../../../../lib/types";
import {
  borderSize,
  colors,
  overflowStyle,
  transitionDuration,
} from "../../../../theme/theme-new";
import Text from "../../../shared-new/Text";

type Props = {
  environment: Environment;
};

const StyledBox = styled(Box)`
  transition: background ${transitionDuration};

  &:hover {
    background: ${colors.gray2};
  }
`;

export default function ListItem({ environment }: Props): JSX.Element {
  return (
    <Button margin={{ bottom: "2px" }} plain>
      <StyledBox
        pad={{ left: "xsmall", right: "xxsmall", vertical: "xxsmall" }}
        round={borderSize.small}
      >
        <Text color="gray9" size="component" style={overflowStyle}>
          {environment.name}
        </Text>
      </StyledBox>
    </Button>
  );
}
