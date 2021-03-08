import { Box } from "grommet";
import { useContext } from "react";
import styled from "styled-components";

import { routes } from "../../../lib/routes";
import { copy } from "../../../theme/copy";
import { width } from "../../../theme/theme";
import Button from "../../shared/Button";
import GitHubStars from "../../shared/GitHubStars";
import Logo from "../../shared/Logo";
import Wrapper from "../../shared/Navigation/Wrapper";
import { UserContext } from "../../UserContext";

type Props = { isJsx?: boolean };

const StyledBox = styled(Box)`
  display: none;

  @media screen and (min-width: ${width.content}) {
    display: flex;
  }
`;

export default function Navigation({ isJsx }: Props): JSX.Element {
  const { user } = useContext(UserContext);

  const href = isJsx ? undefined : routes.blog;
  const label = isJsx ? undefined : copy.blog;

  return (
    <Wrapper>
      <Logo href={href} label={label} textColor="textDark" />
      <StyledBox align="center" direction="row">
        <GitHubStars type="dark" />
        <Button
          href={user ? routes.tests : routes.signUp}
          label={user ? copy.myTests : copy.signUp}
          margin={{ left: "medium" }}
          size="small"
        />
      </StyledBox>
    </Wrapper>
  );
}
