import { Box } from "grommet";
import { ReactNode } from "react";
import styled from "styled-components";

import { borderSize, edgeSize, height, width } from "../../../theme/theme";

type Props = { children: ReactNode };

const StyledBox = styled(Box)`
  max-width: ${width.content};
  padding: 0 ${edgeSize.medium};
  position: relative;

  @media screen and (min-width: ${width.content}) {
    padding: 0;
  }
`;

export default function Wrapper({ children }: Props): JSX.Element {
  return (
    <Box
      align="center"
      background="white"
      border={{ color: "fill20", side: "bottom", size: borderSize.xsmall }}
      flex={false}
      height={height.navigation}
      style={{ position: "sticky", top: 0, zIndex: 1 }}
      width="full"
    >
      <StyledBox
        align="center"
        direction="row"
        justify="between"
        height="full"
        width="full"
      >
        {children}
      </StyledBox>
    </Box>
  );
}
