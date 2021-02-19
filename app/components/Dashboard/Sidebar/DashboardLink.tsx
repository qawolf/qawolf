import { Box, Button } from "grommet";
import { Icon } from "grommet-icons";
import Link from "next/link";
import styled from "styled-components";

import {
  borderSize,
  colors,
  edgeSize,
  transitionDuration,
} from "../../../theme/theme-new";
import Text from "../../shared-new/Text";

type Props = {
  IconComponent: Icon;
  SecondaryIconComponent?: Icon;
  href?: string;
  isSelected?: boolean;
  label: string;
  onClick?: () => void;
  openNewPage?: boolean;
};

const StyledBox = styled(Box)`
  transition: background ${transitionDuration};

  &:hover {
    background: ${colors.gray2};
  }
`;

export default function DashboardLink({
  IconComponent,
  SecondaryIconComponent,
  href,
  isSelected,
  label,
  onClick,
  openNewPage,
}: Props): JSX.Element {
  const innerHtml = (
    <StyledBox
      align="center"
      background={isSelected ? "gray2" : "transparent"}
      direction="row"
      justify="between"
      pad="xxsmall"
      round={borderSize.small}
    >
      <Box align="center" direction="row">
        <IconComponent color={colors.gray9} size={edgeSize.small} />
        <Text color="gray9" margin={{ left: "small" }} size="component">
          {label}
        </Text>
      </Box>
      {!!SecondaryIconComponent && (
        <SecondaryIconComponent color={colors.gray9} size={edgeSize.small} />
      )}
    </StyledBox>
  );

  if (href) {
    return (
      <Link href={href}>
        <a target={openNewPage ? "_blank" : undefined}>{innerHtml}</a>
      </Link>
    );
  }

  return (
    <Button onClick={onClick} plain>
      {innerHtml}
    </Button>
  );
}
