import styled, { css, keyframes } from "styled-components";
import WolfSittingIcon from "./WolfSittingIcon";

type Props = {
  animate?: boolean;
  className?: string;
};

function WolfSitting({ className }: Props): JSX.Element {
  return <WolfSittingIcon className={className} />;
}

const tailWagKeyFrames = keyframes`
0%,
100% {
    transform: rotate(0deg) translate(0px, 0px);
}
50% {
    transform: rotate(-10deg) translate(-1%, -1%);
}
`;

const animationMixin = css`
  animation: ${tailWagKeyFrames} 0.5s ease-in-out infinite forwards;
`;

const StyledWolfSitting = styled(WolfSitting)`
  #wolf-tail {
    transform-origin: bottom center;
    ${(props) => props.animate && animationMixin}
  }

  &:hover {
    #wolf-tail {
      ${animationMixin};
    }
  }
`;

export default StyledWolfSitting;
