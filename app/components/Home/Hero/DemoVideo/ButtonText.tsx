import { Box } from "grommet";
import styled from "styled-components";

import { copy } from "../../../../theme/copy";
import { breakpoints, edgeSize, width } from "../../../../theme/theme-new";
import Text from "../../../shared-new/Text";

const StyledBox = styled(Box)`
  display: none;

  @media screen and (min-width: ${breakpoints.small.value}px) {
    box-shadow: 0px 4px 12px rgba(23, 23, 76, 0.1);
    display: flex;
  }
`;

export default function ButtonText(): JSX.Element {
  return (
    <StyledBox
      align="center"
      background="white"
      height={edgeSize.xxxlarge}
      justify="center"
      margin={{ top: `-${edgeSize.xxsmall}` }}
      round="large"
      width={width.demoVideoPlay}
    >
      <Text color="textDark" size="xxsmall" weight="medium">
        {copy.watchCreate}
      </Text>
      <Text color="textLight" size="xxsmall" weight="normal">
        {copy.watchTime}
      </Text>
    </StyledBox>
  );
}
