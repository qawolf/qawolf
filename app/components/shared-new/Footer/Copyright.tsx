import { Box } from "grommet";
import styled from "styled-components";

import { copy } from "../../../theme/copy";
import { breakpoints, edgeSize } from "../../../theme/theme-new";
import LogoCircle from "../../shared-new/icons/LogoCircle";
import Text from "../Text";

const StyledBox = styled(Box)`
  flex-direction: row-reverse;
  margin-top: ${edgeSize.small};

  @media screen and (min-width: ${breakpoints.small.value}px) {
    flex-direction: row;
    margin-top: 0;
  }
`;

const StyledLogoCircle = styled(LogoCircle)`
  margin-right: ${edgeSize.small};

  @media screen and (min-width: ${breakpoints.small.value}px) {
    margin-left: ${edgeSize.small};
    margin-right: 0;
  }
`;

export default function Copyright(): JSX.Element {
  return (
    <StyledBox align="center">
      <Text color="textDark" size="xxsmall" weight="normal">
        {copy.copyright}
      </Text>
      <StyledLogoCircle />
    </StyledBox>
  );
}
