import { Box } from "grommet";

import { edgeSize } from "../../../../theme/theme";
import { Doc } from "../../docs";
import SectionLink from "./SectionLink";

type Props = {
  docs: Doc[];
  isOpen: boolean;
  pathname: string;
};

export const iconSize = edgeSize.large;

export default function SectionLinks({
  docs,
  isOpen,
  pathname,
}: Props): JSX.Element {
  if (!isOpen) return null;

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
    <Box flex={false} margin={{ left: iconSize }} pad={{ left: "xxxsmall" }}>
      {sectionLinksHtml}
    </Box>
  );
}
