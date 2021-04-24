import styled from "styled-components";

import { breakpoints } from "../../../../../theme/theme";
import Flame from "./Flame";
import InnerFlame from "./InnerFlame";
import RocketIcon from "./RocketIcon";

const flameOffset = "50px";

const StyledDiv = styled.div`
  display: none;

  @media screen and (min-width: ${breakpoints.small.value}px) {
    display: block;
    // offset the difference in height from absolute position flame
    padding-bottom: ${flameOffset};
    padding-top: -${flameOffset};
    position: relative;
  }
`;

export default function Rocket(): JSX.Element {
  return (
    <StyledDiv>
      <InnerFlame />
      <Flame />
      <RocketIcon />
    </StyledDiv>
  );
}
