import { Box, BoxProps } from "grommet";
import { RiGitCommitLine } from "react-icons/ri";

import { colors, edgeSize } from "../../theme/theme";
import Link from "./Link";
import Text from "./Text";

type Props = {
  color?: string;
  commitUrl: string | null;
  isLink?: boolean;
  margin?: BoxProps["margin"];
};

export default function GitCommit({
  color,
  commitUrl,
  isLink,
  margin,
}: Props): JSX.Element {
  if (!commitUrl) return null;

  const finalColor = color || colors.gray7;

  const urlPieces = commitUrl.split("/");
  const sha = urlPieces[urlPieces.length - 1].slice(0, 7);

  const shaHtml = isLink ? (
    <Link href={commitUrl} margin={{ left: "xxsmall" }} newTab>
      {sha}
    </Link>
  ) : (
    <Text color={finalColor} margin={{ left: "xxsmall" }} size="component">
      {sha}
    </Text>
  );

  return (
    <Box align="center" direction="row" margin={margin || { left: "small" }}>
      <RiGitCommitLine color={finalColor} size={edgeSize.small} />
      {shaHtml}
    </Box>
  );
}
