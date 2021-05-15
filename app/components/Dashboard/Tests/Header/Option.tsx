import { Box, Button } from "grommet";
import { ReactNode } from "react";
import styled from "styled-components";

import { colors, transitionDuration } from "../../../../theme/theme";

type Props = {
  a11yTitle: string;
  children: ReactNode;
  onClick: () => void;
};

const StyledBox = styled(Box)`
  transition: background ${transitionDuration};

  &:hover {
    background: ${colors.gray2};
  }

  &:active {
    background: ${colors.gray3};
  }
`;

export default function Option({
  a11yTitle,
  children,
  onClick,
}: Props): JSX.Element {
  return (
    <Button a11yTitle={a11yTitle} onClick={onClick} plain>
      <StyledBox align="center" direction="row" justify="between" width="full">
        {children}
      </StyledBox>
    </Button>
  );
}
