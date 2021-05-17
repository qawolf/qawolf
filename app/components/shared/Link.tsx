import { Box, BoxProps } from "grommet";
import NextLink from "next/link";
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
  newTab?: boolean;
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

export default function Link({
  children,
  isBold,
  href,
  margin,
  newTab,
}: Props): JSX.Element {
  const anchorProps = {
    href: newTab ? href : undefined,
    target: newTab ? "_blank" : undefined,
  };

  let innerHtml = (
    <a {...anchorProps}>
      <StyledText color="primary" size={isBold ? "componentBold" : "component"}>
        {children}
      </StyledText>
    </a>
  );

  if (!newTab) {
    innerHtml = <NextLink href={href}>{innerHtml}</NextLink>;
  }

  return (
    <Box margin={margin} style={{ cursor: "pointer" }}>
      {innerHtml}
    </Box>
  );
}
