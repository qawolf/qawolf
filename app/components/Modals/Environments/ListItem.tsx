import { Box } from "grommet";
import { Environment } from "../../../lib/types";
import { overflowStyle, transitionDuration } from "../../../theme/theme-new";

import Buttons from "./Buttons";
import Text from "../../shared-new/Text";
import styled from "styled-components";

type Props = { environment: Environment };

const StyledBox = styled(Box)`
  button {
    opacity: 0;
    transition: opacity ${transitionDuration};
  }

  &:hover {
    button {
      opacity: 1;
    }
  }
`;

export default function ListItem({ environment }: Props): JSX.Element {
  return (
    <StyledBox align="center" direction="row" flex={false} justify="between">
      <Text
        color="gray9"
        margin={{ vertical: "small" }}
        size="component"
        style={overflowStyle}
      >
        {environment.name}
      </Text>
      <Buttons />
    </StyledBox>
  );
}
