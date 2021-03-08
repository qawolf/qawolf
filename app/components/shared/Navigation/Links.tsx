import { Box } from "grommet";
import styled from "styled-components";

import { NavigationType } from "../../../lib/types";
import { breakpoints } from "../../../theme/theme-new";
import Logo from "../Logo";
import QaWolfLinks from "./QaWolfLinks";

type Props = { type: NavigationType };

const StyledDiv = styled.div`
  display: none;

  @media screen and (min-width: ${breakpoints.small.value}px) {
    align-items: center;
    display: flex;
    flex-direction: row;
  }
`;

export default function Links({ type }: Props): JSX.Element {
  return (
    <Box align="center" direction="row">
      <Logo textColor={type === "dark" ? "textDark" : "white"} />
      <StyledDiv>
        <QaWolfLinks type={type} />
      </StyledDiv>
    </Box>
  );
}
