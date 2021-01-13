import { Box } from "grommet";
import styled from "styled-components";

import { breakpoints } from "../../../theme/theme-new";
import Section from "../Section";
import Buttons from "./Buttons";
import HeaderText from "./HeaderText";
import SpaceFooter from "./SpaceFooter";
import WolfJetpack from "./WolfJetpack";

const StyledBox = styled(Box)`
  flex-direction: column;
  z-index: 1;

  @media screen and (min-width: ${breakpoints.medium.value}px) {
    flex-direction: row;
  }
`;

export default function JoinWolfpack(): JSX.Element {
  return (
    <Section style={{ position: "relative" }}>
      <SpaceFooter />
      <StyledBox align="center" justify="between" width="full">
        <Box>
          <HeaderText />
          <Buttons />
        </Box>
        <WolfJetpack />
      </StyledBox>
    </Section>
  );
}
