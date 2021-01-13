import { Box } from "grommet";
import { useContext } from "react";
import styled from "styled-components";

import { routes } from "../../../lib/routes";
import { copy } from "../../../theme/copy";
import { breakpoints, edgeSize, height } from "../../../theme/theme-new";
import { UserContext } from "../../UserContext";
import Button from "..//Button";
import QaWolfLinks from "./QaWolfLinks";

const basis = "1/2";

const StyledBox = styled(Box)`
  left: 0;
  position: absolute;
  // add a small buffer to cover background / navigation border
  top: calc(${height.navigation} - ${edgeSize.xxxsmall});
  z-index: 3;

  @media screen and (min-width: ${breakpoints.small.value}px) {
    display: none;
  }
`;

export default function Drawer(): JSX.Element {
  const { user } = useContext(UserContext);

  return (
    <StyledBox
      background="white"
      pad={{ bottom: "medium", horizontal: "medium", top: "xxxsmall" }}
      width="full"
    >
      <QaWolfLinks noMargin type="dark" />
      <Box
        direction="row"
        gap={edgeSize.medium}
        justify="between"
        // account for padding from link above
        margin={{ top: `calc(${edgeSize.medium} - ${edgeSize.xxxsmall})` }}
      >
        {!user && (
          <Box basis={basis} fill>
            <Button
              fill
              href={routes.logIn}
              label={copy.logIn}
              type="outlineDark"
              size="small"
            />
          </Box>
        )}
        <Box basis={user ? undefined : basis} fill>
          <Button
            fill
            href={user ? routes.tests : routes.signUp}
            label={user ? copy.myTests : copy.signUp}
            size="small"
          />
        </Box>
      </Box>
    </StyledBox>
  );
}
