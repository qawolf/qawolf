import { Box } from "grommet";
import styled from "styled-components";

import { edgeSize, width } from "../../../theme/theme";
import { Doc, flattenedDocs } from "../docs";
import Divider from "./Divider";
import FooterLink from "./FooterLink";

type Props = { pathname: string };

const StyledBox = styled(Box)`
  // account for intercom widget
  margin-bottom: calc(${edgeSize.xlarge} + 60px);

  @media screen and (min-width: ${width.content}) {
    margin-bottom: ${edgeSize.xlarge};
  }
`;

export default function FooterLinks({ pathname }: Props): JSX.Element {
  const docIndex = flattenedDocs.findIndex(({ href }) => href === pathname);

  let docPrev: Doc | null = null;
  let docNext: Doc | null = null;

  if (docIndex > 0) {
    docPrev = flattenedDocs[docIndex - 1];
  }
  if (docIndex >= 0 && docIndex < flattenedDocs.length - 1) {
    docNext = flattenedDocs[docIndex + 1];
  }

  return (
    <>
      <Divider />
      <StyledBox align="center" direction="row" justify="between" width="full">
        <FooterLink doc={docPrev} type="previous" />
        <FooterLink doc={docNext} type="next" />
      </StyledBox>
    </>
  );
}
