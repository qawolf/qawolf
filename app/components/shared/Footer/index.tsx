import { Box } from "grommet";
import styled from "styled-components";

import { breakpoints, edgeSize } from "../../../theme/theme";
import Section from "../Section";
import Copyright from "./Copyright";
import Links from "./Links";

const StyledBox = styled(Box)`
  flex-direction: column;
  padding: ${edgeSize.large} 0 ${edgeSize.xlarge};

  @media screen and (min-width: ${breakpoints.small.value}px) {
    flex-direction: row;
    padding: ${edgeSize.xlarge} 0;
  }
`;

export default function Footer(): JSX.Element {
  return (
    <Section noPadding>
      <StyledBox align="center" justify="between" width="full">
        <Links />
        <Copyright />
      </StyledBox>
    </Section>
  );
}
