import { Box } from "grommet";
import { CSSProperties } from "react";
import styled from "styled-components";

import { colors } from "../../../../theme/theme-new";
import { star } from "./keyframes";

type Props = {
  animationDelay?: CSSProperties["animationDelay"];
  className?: string;
  left?: CSSProperties["left"];
  right?: CSSProperties["right"];
  size: string;
  top: CSSProperties["top"];
};

function Star({ className, size }: Props): JSX.Element {
  return (
    <Box className={className}>
      <svg
        height={size}
        fill="none"
        viewBox="0 0 32 32"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18.6001 1.87408C17.7672 -0.624693 14.2328 -0.624693 13.3999 1.87408L12.2518 5.31812C11.1606 8.59178 8.59178 11.1606 5.31812 12.2518L1.87408 13.3999C-0.624693 14.2328 -0.624693 17.7672 1.87408 18.6001L5.31812 19.7482C8.59178 20.8394 11.1606 23.4082 12.2518 26.6819L13.3999 30.1259C14.2328 32.6247 17.7672 32.6247 18.6001 30.1259L19.7482 26.6819C20.8394 23.4082 23.4082 20.8394 26.6819 19.7482L30.1259 18.6001C32.6247 17.7672 32.6247 14.2328 30.1259 13.3999L26.6819 12.2518C23.4082 11.1606 20.8394 8.59178 19.7482 5.31812L18.6001 1.87408Z"
          fill={colors.lightPurple}
        />
      </svg>
    </Box>
  );
}

const StyledStar = styled(Star)`
  animation: ${star} 6s ease-in-out infinite;
  position: absolute;
  top: ${(props) => props.top};

  ${(props) => props.left && `left: ${props.left};`}
  ${(props) => props.right && `right: ${props.right};`}

  ${(props) =>
    props.animationDelay && `animation-delay: ${props.animationDelay}`}
`;

export default StyledStar;
