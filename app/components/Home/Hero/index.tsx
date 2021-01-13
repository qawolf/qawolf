import { Box } from "grommet";
import styled from "styled-components";

import { breakpoints, height } from "../../../theme/theme-new";
import DemoVideo from "./DemoVideo";
import GetStarted from "./GetStarted";
import Planets from "./Planets";
import Space from "./Space";
import Stars from "./Stars";

const StyledBox = styled(Box)`
  position: relative;
  // account for sticky nav which needs to be above background
  margin-top: -${height.navigation};
  padding-top: ${height.navigation};

  @media screen and (min-width: ${breakpoints.small.value}px) {
    height: 80vh;
    // 753px is minimum height for this section, so 753px / 0.8 gives max screen height
    @media screen and (max-height: 941px) {
      // 473 + 80 + 200 = 753px
      height: 753px;
    }
  }
`;

export default function Hero(): JSX.Element {
  return (
    <>
      {/* hide overflow from planets */}
      <StyledBox overflow={{ horizontal: "hidden" }}>
        <Space />
        <Planets />
        <Stars />
        <GetStarted />
      </StyledBox>
      <DemoVideo />
    </>
  );
}
