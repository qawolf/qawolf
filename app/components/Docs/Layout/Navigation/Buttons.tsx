import { Box } from "grommet";
import { useContext } from "react";
import styled from "styled-components";

import { routes } from "../../../../lib/routes";
import { copy } from "../../../../theme/copy";
import { edgeSize, width } from "../../../../theme/theme-new";
import Button from "../../../shared-new/Button";
import GitHubStars from "../../../shared-new/GitHubStars";
import { UserContext } from "../../../UserContext";

const slackHref = "https://slack.qawolf.com";

export const handleJoinClick = (): void => {
  window.open(slackHref, "_blank");
};

const StyledBox = styled(Box)`
  display: none;

  @media screen and (min-width: ${width.content}) {
    display: flex;
  }
`;

export default function Buttons(): JSX.Element {
  const { user } = useContext(UserContext);

  return (
    <StyledBox align="center" direction="row">
      <GitHubStars type="dark" />
      <Button
        label={copy.joinSlack}
        margin={{
          horizontal: `calc(${edgeSize.xlarge} - ${edgeSize.xsmall})`,
        }}
        onClick={handleJoinClick}
        size="small"
        type="invisibleDark"
      />
      <Button
        href={user ? routes.tests : routes.signUp}
        label={user ? copy.myTests : copy.signUp}
        size="small"
      />
    </StyledBox>
  );
}
