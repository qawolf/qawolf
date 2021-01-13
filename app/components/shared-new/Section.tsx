import { Box } from "grommet";
import { CSSProperties, ReactNode } from "react";
import styled from "styled-components";

import { breakpoints, edgeSize, width } from "../../theme/theme-new";

type Props = {
  background?: string;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
  style?: CSSProperties;
};

const StyledBox = styled(Box)`
  @media screen and (min-width: ${breakpoints.medium.value}px) {
    max-width: ${width.content};
  }
`;

function Section({
  background,
  children,
  className,
  style,
}: Props): JSX.Element {
  return (
    <Box
      align="center"
      background={background || "white"}
      className={className}
      flex={false}
      style={style}
      width="full"
    >
      <StyledBox align="center" width="full">
        {children}
      </StyledBox>
    </Box>
  );
}

const StyledSection = styled(Section)`
  padding-left: ${edgeSize.medium};
  padding-right: ${edgeSize.medium};
  ${(props) =>
    !props.noPadding &&
    `
  padding-bottom: ${edgeSize.xxxlarge};
  padding-top: ${edgeSize.xxxlarge};
  `}

  @media screen and (min-width: ${breakpoints.small.value}px) {
    padding-left: ${edgeSize.xxxlarge};
    padding-right: ${edgeSize.xxxlarge};
    ${(props) =>
      !props.noPadding &&
      `
    padding-bottom: 80px;
    padding-top: 80px;
    `}
  }

  @media screen and (min-width: ${breakpoints.medium.value}px) {
    padding: 0;
    ${(props) =>
      !props.noPadding &&
      `
    padding-bottom: 120px;
    padding-top: 120px;
    `}
  }
`;

export default StyledSection;
