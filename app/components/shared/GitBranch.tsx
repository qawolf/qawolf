import { Box, BoxProps } from "grommet";
import { RiGitBranchLine } from "react-icons/ri";

import { colors, edgeSize } from "../../theme/theme";
import Text from "./Text";

type Props = {
  branch: string | null;
  color?: string;
  margin?: BoxProps["margin"];
};

export default function GitBranch({
  branch,
  color,
  margin,
}: Props): JSX.Element {
  if (!branch) return null;

  const finalColor = color || colors.gray7;

  return (
    <Box align="center" direction="row" margin={margin || { left: "small" }}>
      <RiGitBranchLine color={finalColor} size={edgeSize.small} />
      <Text color={finalColor} margin={{ left: "xxsmall" }} size="component">
        {branch}
      </Text>
    </Box>
  );
}
