import { Box } from "grommet";
import styled from "styled-components";

import { edgeSize, height, width } from "../../../theme/theme-new";
import { docs } from "../docs";
import Section from "./Section";

type Props = { pathname: string };

const StyledBox = styled(Box)`
  display: none;

  @media screen and (min-width: ${width.content}) {
    display: flex;
    height: calc(100vh - ${height.navigation});
    position: sticky;
    top: ${height.navigation};
  }
`;

export default function Sidebar({ pathname }: Props): JSX.Element {
  const sectionsHtml = docs.map((section, i) => {
    return <Section key={i} pathname={pathname} section={section} />;
  });

  return (
    <StyledBox
      flex={false}
      margin={{ left: `calc((100% - ${width.content}) / 2)` }}
      overflow={{ vertical: "auto" }}
      pad={{ top: edgeSize.large }}
      width={width.docsSidebar}
    >
      {sectionsHtml}
    </StyledBox>
  );
}
