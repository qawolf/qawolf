import { Box } from "grommet";
import Link from "next/link";
import styled from "styled-components";

import { colors, edgeSize, transition } from "../../../../theme/theme";
import Text from "../../../shared/Text";
import { Doc } from "../../docs";

type Props = {
  doc: Doc;
  isSelected: boolean;
};

const StyledBox = styled(Box)`
  cursor: pointer;
  transition: ${transition};

  &:hover {
    background: ${colors.fill10};
  }
`;

export default function SectionLinks({ doc, isSelected }: Props): JSX.Element {
  return (
    <Link href={doc.href}>
      <a style={{ marginTop: edgeSize.xxsmall }}>
        <StyledBox
          background={isSelected ? "fill10" : "transparent"}
          pad={{ horizontal: "xxsmall", vertical: "xxxsmall" }}
          round="xxsmall"
          width="full"
        >
          <Text
            color={isSelected ? "primaryFill" : "textLight"}
            size="xxsmall"
            weight={isSelected ? "medium" : "normal"}
          >
            {doc.name}
          </Text>
        </StyledBox>
      </a>
    </Link>
  );
}
