import { Box } from "grommet";
import { useContext, useState } from "react";
import styled from "styled-components";
import { useAlgoliaDocSearch } from "../../../../hooks/algolia";

import { routes } from "../../../../lib/routes";
import { copy } from "../../../../theme/copy";
import { edgeSize, width } from "../../../../theme/theme-new";
import Button from "../../../shared-new/Button";
import GitHubStars from "../../../shared-new/GitHubStars";
import Search from "../../../shared-new/Search";
import { UserContext } from "../../../UserContext";

const searchWidth = "240px"; // algolia sets it to this width automatically
const slackHref = "https://slack.qawolf.com";

export const handleJoinClick = (): void => {
  window.open(slackHref, "_blank");
};

const StyledBox = styled(Box)`
  display: none;

  @media screen and (min-width: ${width.content}) {
    display: flex;
    width: calc(100% - ${width.docsSidebar} - ${edgeSize.xlarge});
  }
`;

export default function Buttons(): JSX.Element {
  const { user } = useContext(UserContext);
  const [search, setSearch] = useState("");

  useAlgoliaDocSearch();

  return (
    <StyledBox align="center" direction="row" justify="between">
      <Search
        id="algolia-search"
        search={search}
        setSearch={setSearch}
        width={searchWidth}
      />
      <Box align="center" direction="row" flex={false}>
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
      </Box>
    </StyledBox>
  );
}
