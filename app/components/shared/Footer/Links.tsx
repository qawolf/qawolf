import { Box } from "grommet";
import Link from "next/link";
import styled from "styled-components";

import { routes } from "../../../lib/routes";
import { copy } from "../../../theme/copy";
import { breakpoints, edgeSize } from "../../../theme/theme";
import Text from "../Text";

type Props = { className?: string };

const gitHubHref = "https://github.com/qawolf/qawolf";
const roadmapHref = "https://github.com/qawolf/qawolf/projects/4";
const termsHref =
  "https://drive.google.com/file/d/11eZsBbum1qxukqtsZ7TlUzRx-zdqWBXE/view?usp=sharing";

const textProps = {
  color: "textLight",
  hover: true,
  size: "xxsmall" as const,
  weight: "medium" as const,
};

const StyledBox = styled(Box)`
  justify-content: space-between;
  width: 100%;

  @media screen and (min-width: ${breakpoints.small.value}px) {
    justify-content: start;
    width: auto;

    a {
      margin-right: ${edgeSize.xlarge};
    }
  }
`;

export default function Links({ className }: Props): JSX.Element {
  return (
    <StyledBox className={className} direction="row">
      <a href={gitHubHref} rel="noopener" target="_blank">
        <Text {...textProps}>{copy.gitHub}</Text>
      </a>
      <Link href={routes.docs}>
        <a>
          <Text {...textProps}>{copy.docs}</Text>
        </a>
      </Link>
      <a href={roadmapHref} rel="noopener" target="_blank">
        <Text {...textProps}>{copy.roadmap}</Text>
      </a>
      <a href={termsHref} rel="noopener" target="_blank">
        <Text {...textProps}>{copy.terms}</Text>
      </a>
    </StyledBox>
  );
}
