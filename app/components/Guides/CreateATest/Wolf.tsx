import { Box } from "grommet";
import styled, { keyframes } from "styled-components";

import WolfSitting from "../../shared/icons/WolfSitting";
import { headerProps } from "./helpers";

type Props = {
  animate?: boolean;
  background?: string;
  color?: string;
};

const width = "180";

const wolfKeyFrames = keyframes`
0% {
  opacity: 0;
  transform: scale(0, 0);
}
50% {
  opacity: 0.5;
  transform: scale(1.2, 1.2);
}
100% {
  opacity: 1;
  transform: scale(1, 1);
}
`;

const StyledBox = styled(Box)`
  animation: ${wolfKeyFrames} 0.8s ease-in-out;
`;

export default function Wolf({
  animate,
  background,
  color,
}: Props): JSX.Element {
  const BoxComponent = animate ? StyledBox : Box;

  return (
    <Box {...headerProps} background={background || "gray1"}>
      {!!color && (
        <BoxComponent alignSelf="center" flex={false}>
          <WolfSitting animate color={color} noGrab width={width} />
        </BoxComponent>
      )}
    </Box>
  );
}
