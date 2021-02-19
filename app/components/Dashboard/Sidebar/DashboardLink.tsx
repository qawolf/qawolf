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
  href?: string;
  isSelected?: boolean;
  label: string;
  onClick?: () => void;
};

const StyledBox = styled(Box)`
  transition: background ${transitionDuration};

  &:hover {
    background: ${colors.gray2};
  }
`;

export default function DashboardLink({
  IconComponent,
  href,
  isSelected,
  label,
  onClick,
}: Props): JSX.Element {
  const innerHtml = (
    <StyledBox
      align="center"
      background={isSelected ? "gray2" : "transparent"}
      direction="row"
      pad="xxsmall"
      round={borderSize.small}
    >
      <IconComponent color={colors.gray9} size={edgeSize.small} />
      <Text color="gray9" margin={{ left: "small" }} size="component">
        {label}
      </Text>
    </StyledBox>
  );

  if (href) {
    return (
      <Link href={href}>
        <a>{innerHtml}</a>
      </Link>
    );
  }

  return (
    <Button onClick={onClick} plain>
      {innerHtml}
    </Button>
  );
}
