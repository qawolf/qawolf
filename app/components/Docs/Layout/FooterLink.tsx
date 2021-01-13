import { Box } from "grommet";
import Link from "next/link";
import { RiArrowLeftLine, RiArrowRightLine } from "react-icons/ri";
import styled from "styled-components";

import {
  colors,
  edgeSize,
  transitionDuration,
  width,
} from "../../../theme/theme-new";
import Text from "../../shared-new/Text";
import { Doc } from "../docs";

type Props = {
  doc: Doc | null;
  type: "next" | "previous";
};

const iconMargin = edgeSize.xxsmall;
const iconSize = edgeSize.small;

const StyledBox = styled(Box)`
  transition: background ${transitionDuration};

  &:hover {
    background: ${colors.fill10};
  }
`;

const StyledRiArrowLeftLine = styled(RiArrowLeftLine)`
  @media screen and (min-width: ${width.content}) {
    margin-right: ${iconMargin};
  }
`;

const StyledRiArrowRightLine = styled(RiArrowRightLine)`
  @media screen and (min-width: ${width.content}) {
    margin-left: ${iconMargin};
  }
`;

const StyledText = styled(Text)`
  display: none;

  @media screen and (min-width: ${width.content}) {
    display: block;
  }
`;

export default function FooterLink({ doc, type }: Props): JSX.Element {
  if (!doc) return <Box />;

  return (
    <Link href={doc.href}>
      <a>
        <StyledBox
          align="center"
          direction="row"
          pad={{ horizontal: "xsmall", vertical: "xxxsmall" }}
          round="xxxsmall"
        >
          {type === "previous" && (
            <StyledRiArrowLeftLine color={colors.textDark} size={iconSize} />
          )}
          <StyledText
            color="textDark"
            size="xxsmall"
            textAs="h6"
            weight="medium"
          >
            {doc.name}
          </StyledText>
          {type === "next" && (
            <StyledRiArrowRightLine color={colors.textDark} size={iconSize} />
          )}
        </StyledBox>
      </a>
    </Link>
  );
}
