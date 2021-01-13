import { Box, Button } from "grommet";
import { useState } from "react";

import { colors, edgeSize } from "../../../../theme/theme-new";
import Text from "../../../shared-new/Text";
import { Doc, Section as SectionType } from "../../docs";
import SectionLinks, { iconSize } from "./SectionLinks";

type Props = {
  pathname: string;
  section: SectionType;
};

const shouldBeOpen = (docs: Doc[], pathname: string): boolean => {
  const matchingDoc = docs.find((doc) => doc.href === pathname);

  return !!matchingDoc;
};

export default function Section({ pathname, section }: Props): JSX.Element {
  const { IconComponent, color, docs, name } = section;

  const [isOpen, setIsOpen] = useState(shouldBeOpen(docs, pathname));

  const handleClick = (): void => {
    if (shouldBeOpen(docs, pathname)) return;
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <Button
        a11yTitle={`toggle ${name} docs`}
        onClick={handleClick}
        plain
        style={{ cursor: "pointer" }}
      >
        <Box
          align="center"
          direction="row"
          flex={false}
          height="32px"
          margin={{ top: edgeSize.small }}
        >
          <Box
            align="center"
            background={color}
            height={iconSize}
            justify="center"
            margin={{ right: edgeSize.xsmall }}
            round="xxsmall"
            width={iconSize}
          >
            <IconComponent color={colors.white} size={edgeSize.medium} />
          </Box>
          <Text color="textDark" size="xxsmall" weight="medium">
            {name}
          </Text>
        </Box>
      </Button>
      <SectionLinks docs={docs} isOpen={isOpen} pathname={pathname} />
    </>
  );
}
