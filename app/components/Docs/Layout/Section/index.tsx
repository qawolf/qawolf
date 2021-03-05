import { Box, Button } from "grommet";
import styled from "styled-components";

import {
  colors,
  edgeSize,
  transitionDuration,
} from "../../../../theme/theme-new";
import Text from "../../../shared-new/Text";
import { Section as SectionType } from "../../docs";
import SectionLinks, { iconSize } from "./SectionLinks";

type Props = {
  isOpen: boolean;
  onClick: () => void;
  pathname: string;
  section: SectionType;
};

const StyledBox = styled(Box)`
  border-radius: ${edgeSize.xxsmall};
  transition: background ${transitionDuration};

  &:hover {
    background: ${colors.fill10};
  }
`;

export default function Section({
  isOpen,
  onClick,
  pathname,
  section,
}: Props): JSX.Element {
  const { IconComponent, color, docs, name } = section;
  const isCurrent = docs.find((d) => d.href === pathname);

  return (
    <>
      <Button
        a11yTitle={`toggle ${name} docs`}
        margin={{ top: edgeSize.small }}
        onClick={onClick}
        plain
        style={{ cursor: "pointer" }}
      >
        <StyledBox
          align="center"
          background={isCurrent ? "fill10" : "transparent"}
          direction="row"
          flex={false}
          height="32px"
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
        </StyledBox>
      </Button>
      <SectionLinks docs={docs} isOpen={isOpen} pathname={pathname} />
    </>
  );
}
