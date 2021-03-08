import { Box } from "grommet";
import styled from "styled-components";

import { edgeSize } from "../../../../theme/theme-new";
import { Doc } from "../../docs";
import SectionLink from "./SectionLink";

type Props = {
  className?: string;
  docs: Doc[];
  isOpen: boolean;
  pathname: string;
};

export const iconSize = edgeSize.large;

function SectionLinks({ className, docs, pathname }: Props): JSX.Element {
  const sectionLinksHtml = docs.map((doc) => {
    return (
      <SectionLink
        doc={doc}
        isSelected={doc.href === pathname}
        key={doc.href}
      />
    );
  });

  return (
    <Box
      className={className}
      flex={false}
      margin={{ left: iconSize }}
      pad={{ left: "xxxsmall" }}
    >
      {sectionLinksHtml}
    </Box>
  );
}

const StyledSectionLinks = styled(SectionLinks)`
  // each link is 40 px tall including margin
  height: ${({ docs }) => `${docs.length * 40}px`};
  overflow: hidden;
  transition: height 100ms ease-in-out;
  ${(props) =>
    !props.isOpen &&
    `
  height: 0;
  `}
`;

export default StyledSectionLinks;
