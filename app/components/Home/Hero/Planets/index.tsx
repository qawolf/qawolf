import styled from "styled-components";

import { breakpoints } from "../../../../theme/theme-new";
import BluePlanet from "./BluePlanet";
import PurplePlanet from "./PurplePlanet";
import TealPlanet from "./TealPlanet";

const StyledDiv = styled.div`
  display: none;

  @media screen and (min-width: ${breakpoints.medium.value}px) {
    display: block;
  }
`;

export default function Planets(): JSX.Element {
  return (
    <StyledDiv>
      <BluePlanet />
      <PurplePlanet />
      <TealPlanet />
    </StyledDiv>
  );
}
