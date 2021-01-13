import { Box, BoxProps } from "grommet";
import Link from "next/link";
import { ReactNode } from "react";
import styled from "styled-components";

import { breakpoints } from "../../../theme/theme-new";
import { height, heightDesktop,Size } from "./config";

type Props = {
  children: ReactNode;
  className?: string;
  href: string;
  margin?: BoxProps["margin"];
  size: Size;
};

function Anchor({ children, className, href, margin }: Props): JSX.Element {
  return (
    <Box margin={margin}>
      <Link href={href}>
        <a className={className}>{children}</a>
      </Link>
    </Box>
  );
}

const StyledAnchor = styled(Anchor)`
  height: ${(props) => height[props.size]};

  @media screen and (min-width: ${breakpoints.medium.value}px) {
    height: ${(props) => heightDesktop[props.size]};
  }
`;

export default StyledAnchor;
