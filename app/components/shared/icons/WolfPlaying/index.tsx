import styled, { css, keyframes } from "styled-components";

import WolfPlayingIcon from "./WolfPlayingIcon";

type Props = {
  className?: string;
  color: string;
};

function WolfPlaying({ className, color }: Props): JSX.Element {
  return <WolfPlayingIcon className={className} color={color} />;
}

const tailWagKeyFrames = keyframes`
0%,
100% {
    transform: rotate(0deg) translate(0px, 0px);
}
50% {
    transform: rotate(5deg) translate(0.5%, 0.5%);
}
`;

const animationMixin = css`
  animation: ${tailWagKeyFrames} 0.5s ease-in-out infinite forwards;
`;

const StyledWolfPlaying = styled(WolfPlaying)`
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

export default StyledWolfPlaying;
