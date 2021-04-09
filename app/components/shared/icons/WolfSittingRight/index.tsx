import styled, { css, keyframes } from "styled-components";

import WolfSittingIcon from "./WolfSittingIcon";

type Props = {
  className?: string;
  color: string;
};

function WolfSittingRight({ className, color }: Props): JSX.Element {
  return <WolfSittingIcon className={className} color={color} />;
}

const tailWagKeyFrames = keyframes`
0%,
100% {
    transform: rotate(0deg) translate(0px, 0px);
}
50% {
    transform: rotate(10deg) translate(1%, 1%);
}
`;

const animationMixin = css`
  animation: ${tailWagKeyFrames} 0.5s ease-in-out infinite forwards;
`;

const StyledWolfSittingRight = styled(WolfSittingRight)`
  #wolf-tail {
    transform-origin: bottom center;
  }

  &:hover {
    cursor: grab;

    #wolf-tail {
      ${animationMixin};
    }
  }
`;

export default StyledWolfSittingRight;
