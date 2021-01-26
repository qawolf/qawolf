import { Box, Button } from "grommet";
import { Icon } from "grommet-icons";
import styled from "styled-components";
import {
  borderSize,
  colors,
  edgeSize,
  transitionDuration,
} from "../../theme/theme-new";

type Props = {
  IconComponent?: Icon;
  a11yTitle?: string;
  label?: string;
  onClick: () => void;
};

const StyledBox = styled(Box)`
  transition: background ${transitionDuration};

  &:hover {
    background: ${colors.gray2};
  }
`;

export default function AppButton({
  IconComponent,
  a11yTitle,
  label,
  onClick,
}: Props): JSX.Element {
  return (
    <Button a11yTitle={a11yTitle || label} onClick={onClick} plain>
      <StyledBox pad="xxsmall" round={borderSize.small}>
        {!!IconComponent && (
          <IconComponent color={colors.gray9} size={edgeSize.small} />
        )}
      </StyledBox>
    </Button>
  );
}
