import { Box } from "grommet";
import styled from "styled-components";

import { borderSize, breakpoints, edgeSize } from "../../../theme/theme";

const StyledBox = styled(Box)`
  margin: ${edgeSize.medium} 0;

  @media screen and (min-width: ${breakpoints.medium.value}px) {
    margin: ${edgeSize.xlarge} 0;
  }
`;

export default function Divider(): JSX.Element {
  return (
    <StyledBox
      background="fill20"
      flex={false}
      height={borderSize.xsmall}
      width="full"
    />
  );
}
