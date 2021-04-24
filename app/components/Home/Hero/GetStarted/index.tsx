import { Box } from "grommet";
import styled from "styled-components";

import { breakpoints, edgeSize, offset, width } from "../../../../theme/theme";
import RocketContainer from "./RocketContainer";
import Tagline from "./Tagline";

const basis = "1/2";

const StyledBox = styled(Box)`
  flex-direction: column-reverse;
  margin: ${edgeSize.medium} 0 128px;
  padding: 0 ${edgeSize.medium};
  z-index: 1;

  @media screen and (min-width: ${breakpoints.small.value}px) {
    align-items: center;
    flex-direction: row;
    height: 100%;
    margin: ${offset.hero} ${edgeSize.xxxlarge} 0;
    padding: 0;
    width: calc(100% - 2 * ${edgeSize.xxxlarge});
  }

  // 1080 + 64 * 2 = 1208px
  @media screen and (min-width: 1208px) {
    margin: ${offset.hero} auto 0;
    width: ${width.content};
  }
`;

export default function GetStarted(): JSX.Element {
  return (
    <StyledBox>
      <Tagline basis={basis} />
      <RocketContainer basis={basis} />
    </StyledBox>
  );
}
