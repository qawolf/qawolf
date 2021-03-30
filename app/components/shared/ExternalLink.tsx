import { Box, BoxProps } from "grommet";
import styled from "styled-components";

import { colors } from "../../theme/theme";
import Text from "./Text";

type Props = {
  children: string;
  href: string;
  margin?: BoxProps["margin"];
};

const StyledText = styled(Text)`
  &:hover {
    color: ${colors.primaryDark};
  }

  &:active {
    color: ${colors.primaryDarker};
  }
`;

export default function ExternalLink({
  children,
  href,
  margin,
}: Props): JSX.Element {
  return (
    <Box margin={margin}>
      <a href={href} target="_blank">
        <StyledText color="primary" size="component">
          {children}
        </StyledText>
      </a>
    </Box>
  );
}
