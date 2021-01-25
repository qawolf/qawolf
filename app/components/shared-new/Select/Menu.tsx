import { Box } from "grommet";
import styled, { keyframes } from "styled-components";

import { edgeSize } from "../../../theme/theme-new";

import { height } from "./Chooser";

const round = "2px";

// https://github.com/grommet/grommet/blob/master/src/js/components/Drop/StyledDrop.js
const menuKeyFrames = keyframes`
  0% {
    opacity: 0.5;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

const StyledBox = styled(Box)`
  animation: ${menuKeyFrames} 0.1s forwards;
  animation-delay: 0.01s;
  bottom: calc(${height} + ${edgeSize.xxxsmall});
  box-shadow: 0px 4px 16px rgba(21, 27, 38, 0.16);
  opacity: 0;
  position: absolute;
  transform-origin: bottom center;
`;

export default function Menu(): JSX.Element {
  return (
    <StyledBox background="gray0" height="100px" round={round} width="100%" />
  );
}
