import { Box, BoxProps } from "grommet";
import styled from "styled-components";

import { breakpoints, edgeSize } from "../../../../theme/theme";
import Rocket from "./Rocket";
import RocketMobile from "./Rocket/RocketMobile";

type Props = { basis: BoxProps["basis"] };

const StyledBox = styled(Box)`
  max-width: 240px;

  @media screen and (min-width: ${breakpoints.small.value}px) {
    max-width: none;
    padding-left: calc(${edgeSize.xlarge} / 2);
  }
`;

export default function RocketContainer({ basis }: Props): JSX.Element {
  return (
    <StyledBox align="center" alignSelf="center" basis={basis}>
      <RocketMobile />
      <Rocket />
    </StyledBox>
  );
}
