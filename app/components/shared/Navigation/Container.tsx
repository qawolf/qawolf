import { Box } from "grommet";
import { ReactNode } from "react";
import styled from "styled-components";

import {
  borderSize,
  breakpoints,
  colors,
  edgeSize,
  height,
} from "../../../theme/theme";

type Props = {
  children: ReactNode;
  className?: string;
  transparent?: boolean;
};

function Container({ children, className, transparent }: Props): JSX.Element {
  const border = {
    color: transparent ? "transparent" : "fill20",
    side: "bottom" as const,
    size: borderSize.xsmall,
  };

  return (
    <Box
      as="nav"
      border={border}
      className={className}
      flex={false}
      height={height.navigation}
      width="full"
    >
      {children}
    </Box>
  );
}

const StyledContainer = styled(Container)`
  // account for hamburger in padding
  padding: 0 calc(${edgeSize.medium} - 14px) 0 ${edgeSize.medium};
  position: sticky;
  top: 0;
  z-index: 3;
  ${(props) => !props.transparent && `background: ${colors.white};`}

  @media screen and (min-width: ${breakpoints.small.value}px) {
    padding: 0 ${edgeSize.xxxlarge};
  }
`;

export default StyledContainer;
