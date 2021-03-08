import { Box } from "grommet";
import Link from "next/link";
import styled from "styled-components";

import { routes } from "../../lib/routes";
import { copy } from "../../theme/copy";
import { breakpoints, edgeSize } from "../../theme/theme";
import LogoIcon from "./icons/Logo";
import Text from "./Text";

type Props = {
  href?: string;
  label?: string;
  textColor?: string;
};

const StyledText = styled(Text)`
  display: none;

  @media screen and (min-width: ${breakpoints.small.value}px) {
    display: inline;
  }
`;

export default function Logo({ href, label, textColor }: Props): JSX.Element {
  // do not make custom label invisible on mobile
  const TextComponent = label ? Text : StyledText;

  return (
    <Link href={href || routes.home}>
      <a>
        <Box align="center" direction="row">
          <LogoIcon width={edgeSize.large} />
          <TextComponent
            color={textColor || "textDark"}
            margin={{ left: "xxsmall" }}
            size="xxsmall"
            weight="bold"
          >
            {label || copy.qawolf}
          </TextComponent>
        </Box>
      </a>
    </Link>
  );
}
