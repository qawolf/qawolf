import { Box } from "grommet";
import styled, { keyframes } from "styled-components";
import { edgeSize } from "../../theme/theme-new";
import Paw from "./icons/Paw";

type Props = { size?: "large" | "small" };

const animationDelay = 500;
const pawCount = 6;

const pawKeyFrames = keyframes`
0% {
    opacity: 1;
}
50% {
    opacity: 0;
}
100% {
    opacity: 0;
}
`;

const StyledBox = styled(Box)`
  .even svg {
    transform: rotate(80deg);
  }

  .odd svg {
    transform: rotate(100deg);
  }

  .paw {
    opacity: 0;
    animation: ${pawKeyFrames} 3s ease-in-out infinite;
  }
`;

export default function Spinner({ size }: Props): JSX.Element {
  const pawsHtml: JSX.Element[] = [];

  const iconSize = size === "small" ? edgeSize.xxsmall : edgeSize.xlarge;
  const rightMargin = size === "small" ? edgeSize.xxsmall : edgeSize.small;
  const topMargin = size === "small" ? 10 : 80;

  for (let i = 0; i < pawCount; i++) {
    pawsHtml.push(
      <Box
        className={i % 2 === 0 ? "paw even" : "paw odd"}
        key={i}
        margin={{
          right: i < pawCount - 1 ? rightMargin : "0",
          top: i % 2 === 0 ? `-${topMargin}px` : `${topMargin}px`,
        }}
        style={{ animationDelay: `${(i + 1) * animationDelay}ms` }}
      >
        <Paw color="gray9" size={iconSize} />
      </Box>
    );
  }

  return (
    <StyledBox align="center" direction="row" fill flex justify="center">
      {pawsHtml}
    </StyledBox>
  );
}
