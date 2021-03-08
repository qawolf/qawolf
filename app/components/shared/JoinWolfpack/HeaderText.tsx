import { Box } from "grommet";
import styled from "styled-components";

import { copy } from "../../../theme/copy";
import { breakpoints } from "../../../theme/theme";
import Text from "../Text";

const StyledText = styled(Text)`
  text-align: center;

  @media screen and (min-width: ${breakpoints.medium.value}px) {
    text-align: start;
  }
`;

export default function HeaderText(): JSX.Element {
  return (
    <Box>
      <StyledText
        color="primaryTextLight"
        margin={{ bottom: "medium" }}
        size="eyebrow"
      >
        {copy.curious}
      </StyledText>
      <StyledText color="white" size="xlarge" weight="bold">
        {copy.joinWolfPack}
      </StyledText>
    </Box>
  );
}
