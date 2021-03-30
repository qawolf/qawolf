import { Box, BoxProps } from "grommet";
import styled from "styled-components";

import { colors } from "../../theme/theme";
import Text from "./Text";

type Props = {
  children: string;
  isBold?: boolean;
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
  isBold,
  href,
  margin,
}: Props): JSX.Element {
  return (
    <Box margin={margin}>
      <a href={href} target="_blank">
        <StyledText
          color="primary"
          size={isBold ? "componentBold" : "component"}
        >
          {children}
        </StyledText>
      </a>
    </Box>
  );
}
