import { Box, Button } from "grommet";
import { useRouter } from "next/router";

import { colors, edgeSize } from "../../../../theme/theme-new";
import Text from "../../../shared-new/Text";
import { Section as SectionType } from "../../docs";
import SectionLinks, { iconSize } from "./SectionLinks";

type Props = {
  pathname: string;
  section: SectionType;
};

export default function Section({ pathname, section }: Props): JSX.Element {
  const { push } = useRouter();

  const { IconComponent, color, docs, name } = section;

  const isOpen = !!docs.find((doc) => doc.href === pathname);

  const handleClick = (): void => {
    // open the section's first doc
    push(docs[0].href);
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
