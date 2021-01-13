import { Box } from "grommet";
import { FaPlay } from "react-icons/fa";
import styled from "styled-components";

import {
  borderSize,
  breakpoints,
  colors,
  edgeSize,
  transition,
  width,
} from "../../../../theme/theme-new";
import ButtonText from "./ButtonText";

const StyledBox = styled(Box)`
  left: calc(50% - (${edgeSize.xxxlarge} + ${borderSize.medium} * 2) / 2);
  position: absolute;
  top: calc(50% - (${edgeSize.xxxlarge} + ${borderSize.medium} * 2) / 2);

  @media screen and (min-width: ${breakpoints.small.value}px) {
    left: calc(50% - ${width.demoVideoPlay} / 2);
    top: calc(50% - 128px / 2);
  }
`;

export default function PlayButton(): JSX.Element {
  return (
    <StyledBox align="center">
      <Box
        align="center"
        background="primaryFill"
        border={{ color: "primaryFillLight", size: "medium" }}
        id="play-button"
        height={edgeSize.xxxlarge}
        justify="center"
        round="full"
        style={{ boxSizing: "content-box", transition, zIndex: 1 }}
        width={edgeSize.xxxlarge}
      >
        <FaPlay color={colors.white} size={edgeSize.medium} />
      </Box>
      <ButtonText />
    </StyledBox>
  );
}
