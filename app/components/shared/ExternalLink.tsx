import { Box, BoxProps } from "grommet";
import styled from "styled-components";

import { isServer } from "../../lib/detection";
import { routes } from "../../lib/routes";
import { colors } from "../../theme/theme";
import Text from "./Text";

type Props = {
  children: string;
  isBold?: boolean;
  href: string;
  margin?: BoxProps["margin"];
};

export const buildQaWolfDocsLink = (href: string): string => {
  return new URL(
    `${routes.docs}${href}`,
    isServer() ? "https://www.qawolf.com" : window.location.origin
  ).href;
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
