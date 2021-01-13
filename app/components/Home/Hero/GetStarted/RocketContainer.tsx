import { Box, BoxProps } from "grommet";
import styled from "styled-components";

import { breakpoints, edgeSize } from "../../../../theme/theme-new";
import Rocket from "./Rocket";
import RocketMobile from "./Rocket/RocketMobile";

type Props = { basis: BoxProps["basis"] };

const StyledBox = styled(Box)`
  @media screen and (min-width: ${breakpoints.small.value}px) {
    padding-left: calc(${edgeSize.xlarge} / 2);
  }
`;

export default function RocketContainer({ basis }: Props): JSX.Element {
  return (
    <StyledBox align="center" basis={basis}>
      <RocketMobile />
      <Rocket />
    </StyledBox>
  );
}
