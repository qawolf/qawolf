import styled, { css, keyframes } from "styled-components";
import WolfSittingIcon from "./WolfSittingIcon";

type Props = {
  animate?: boolean;
  className?: string;
  color: string;
};

function WolfSitting({ className, color }: Props): JSX.Element {
  return <WolfSittingIcon className={className} color={color} />;
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
    cursor: grab;

    #wolf-tail {
      ${animationMixin};
    }
  }
`;

export default StyledWolfSitting;
