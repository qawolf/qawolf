import { Box, BoxProps } from "grommet";
import { ReactNode } from "react";
import styled, { keyframes } from "styled-components";

import { boxShadow, edgeSize } from "../../theme/theme";

export type Direction = "down" | "up";

type Props = {
  children: ReactNode;
  className?: string;
  direction?: Direction;
  onClick?: () => void;
  right?: string;
  top?: string;
  width?: BoxProps["width"];
};

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

function Menu({ children, className, onClick, width }: Props): JSX.Element {
  return (
    <Box
      background="gray0"
      className={className}
      onClick={onClick}
      overflow="hidden"
      pad={{ vertical: "xxxsmall" }}
      round={round}
      width={width || "full"}
    >
      {children}
    </Box>
  );
}

const StyledMenu = styled(Menu)`
  animation: ${menuKeyFrames} 0.1s forwards;
  animation-delay: 0.01s;
  box-shadow: ${boxShadow};
  max-width: none;
  opacity: 0;
  position: absolute;
  right: ${(props) => props.right || "0"};
  transform-origin: ${(props) => (props.direction === "up" ? "bottom" : "top")}
    center;
  z-index: 1;

  ${(props) =>
    props.direction === "up"
      ? `bottom: calc(${edgeSize.large} + ${edgeSize.xxxsmall});`
      : `top: ${
          props.top || `calc(${edgeSize.large} + ${edgeSize.xxxsmall})`
        };`}
`;

export default StyledMenu;
