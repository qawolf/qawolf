import { Box } from "grommet";
import kebabCase from "lodash/kebabCase";
import Link from "next/link";
import { useRouter } from "next/router";
import styled from "styled-components";

import {
  colors,
  edgeSize,
  height,
  transition,
  transitionDuration,
} from "../../theme/theme";
import LinkIcon from "../shared/icons/Link";
import Text from "../shared/Text";
import Divider from "./Layout/Divider";

type Props = { children: string };

const StyledBox = styled(Box)`
  h2 {
    border-bottom: 1px dotted transparent;
    transition: border-color ${transitionDuration};
  }

  svg {
    fill: transparent;
  }

  &:hover {
    h2 {
      border-color: ${colors.textDark};
    }

    svg {
      fill: ${colors.textDark};
    }
  }
`;

export default function SubHeader({ children }: Props): JSX.Element {
  const { pathname } = useRouter();

  const id = kebabCase(children);

  return (
    <>
      <Divider />
      <Link href={`${pathname}#${id}`}>
        <a
          id={id}
          // offset sticky navigation
          style={{
            marginTop: `-${height.navigation}`,
            paddingTop: height.navigation,
          }}
        >
          <StyledBox align="center" direction="row">
            <Text
              color="textDark"
              margin={{ right: "xxsmall" }}
              size="medium"
              textAs="h2"
              weight="bold"
            >
              {children}
            </Text>
            <LinkIcon size={edgeSize.medium} style={{ transition }} />
          </StyledBox>
        </a>
      </Link>
    </>
  );
}
