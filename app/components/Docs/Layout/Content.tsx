import { Box } from "grommet";
import { ReactNode } from "react";
import styled from "styled-components";

import {
  breakpoints,
  colors,
  edgeSize,
  fontFamily,
  fontWeight,
  text,
  textDesktop,
  transitionDuration,
  width,
} from "../../../theme/theme";
import FooterLinks from "./FooterLinks";

type Props = {
  children: ReactNode;
  className?: string;
  noSidebar?: boolean;
  pathname?: string;
};

function Content({ children, className, pathname }: Props): JSX.Element {
  return (
    <Box
      align="start"
      className={className}
      fill="horizontal"
      overflow={{ vertical: "auto" }}
    >
      {children}
      {!!pathname && <FooterLinks pathname={pathname} />}
    </Box>
  );
}

const StyledContent = styled(Content)`
  color: ${colors.textLight};
  font-family: ${fontFamily.normal};
  padding: 0 ${edgeSize.medium};
  word-break: break-word;

  a,
  b,
  strong {
    font-family: ${fontFamily.medium};
    font-weight: ${fontWeight.medium};
  }

  a {
    color: ${colors.primaryFill};
    cursor: pointer;
    transition: color ${transitionDuration};

    &:hover {
      color: ${colors.primaryHover};
    }
  }

  code {
    background: ${colors.fill10};
    border-radius: ${edgeSize.xxxsmall};
    color: ${colors.code};
    padding: 0 ${edgeSize.xxsmall};
  }

  h3 {
    color: ${colors.textDark};
    font-family: ${fontFamily.bold};
    font-size: ${text.small.size};
    font-weight: ${fontWeight.bold};
    line-height: ${text.small.height};
    margin-top: ${edgeSize.small};
  }

  li,
  p,
  table {
    font-size: ${text.xsmall.size};
    line-height: ${text.xsmall.height};
    margin-top: ${edgeSize.small};
  }

  li {
    margin-top: ${edgeSize.xxsmall};
  }

  li::marker {
    color: ${colors.fill30};
    font-size: 1.2em;
  }

  pre {
    margin-bottom: 0;
  }

  table,
  td,
  th {
    border: 1px solid ${colors.fill20};
    border-collapse: collapse;
  }

  td,
  th {
    padding: ${edgeSize.xxsmall};
    vertical-align: top;
    width: 50%;
  }

  @media screen and (min-width: ${width.content}) {
    padding: 0;
    ${(props) =>
      !props.noSidebar &&
      `
    padding-left: ${edgeSize.xlarge};
    padding-right: calc((100% - ${width.content}) / 2);
    `}
  }

  @media screen and (min-width: ${breakpoints.medium.value}px) {
    h3 {
      font-size: ${textDesktop.small.size};
      line-height: ${textDesktop.small.height};
      margin-top: ${edgeSize.medium};
    }

    li,
    p,
    table {
      font-size: ${textDesktop.xsmall.size};
      line-height: ${textDesktop.xsmall.height};
      margin-top: ${edgeSize.medium};
    }

    li {
      margin-top: ${edgeSize.xxsmall};
    }
  }
`;

export default StyledContent;
