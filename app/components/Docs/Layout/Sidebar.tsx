import { Box } from "grommet";
import styled from "styled-components";

import { breakpoints, edgeSize, height, width } from "../../../theme/theme-new";
import { docs } from "../docs";
import Section from "./Section";
import Wolf from "./Wolf";

type Props = { pathname: string };

const StyledBox = styled(Box)`
  display: none;

  @media screen and (min-width: ${width.content}) {
    display: flex;
    height: calc(100vh - ${height.navigation});
    // 2px is half the different in height between title (36px) and sidebar item (32px)
    padding-top: calc(${edgeSize.xlarge} - ${edgeSize.small} + 2px);
    position: sticky;
    top: ${height.navigation};
  }

  @media screen and (min-width: ${breakpoints.medium.value}px) {
    // 10px is half the different in height between title (52px) and sidebar item (32px)
    padding-top: calc(${edgeSize.xlarge} - ${edgeSize.small} + 10px);
  }
`;

export default function Sidebar({ pathname }: Props): JSX.Element {
  const sectionsHtml = docs.map((section, i) => {
    return <Section key={i} pathname={pathname} section={section} />;
  });

  return (
    <StyledBox
      flex={false}
      justify="between"
      margin={{ left: `calc((100% - ${width.content}) / 2)` }}
      width={width.docsSidebar}
    >
      <Box overflow={{ vertical: "auto" }}>{sectionsHtml}</Box>
      <Wolf />
    </StyledBox>
  );
}
