import { Box, BoxProps } from "grommet";
import { RiGitBranchLine } from "react-icons/ri";

import { colors, edgeSize } from "../../theme/theme";
import Text from "./Text";

type Props = {
  branch: string | null;
  margin: BoxProps["margin"];
};

export default function GitBranch({ branch, margin }: Props): JSX.Element {
  if (!branch) return null;

  return (
    <Box align="center" direction="row" margin={margin || { left: "small" }}>
      <RiGitBranchLine color={colors.gray7} size={edgeSize.small} />
      <Text color="gray7" margin={{ left: "xxsmall" }} size="component">
        {branch}
      </Text>
    </Box>
  );
}
