import { Box, BoxProps } from "grommet";
import { RiGitBranchLine } from "react-icons/ri";

import { colors, edgeSize, overflowStyle } from "../../theme/theme";
import Text from "./Text";

type Props = {
  branch: string | null;
  margin?: BoxProps["margin"];
};

export default function GitBranch({ branch, margin }: Props): JSX.Element {
  if (!branch) return null;

  return (
    <Box align="center" direction="row" margin={margin || { left: "small" }}>
      <Box flex={false}>
        <RiGitBranchLine color={colors.gray7} size={edgeSize.small} />
      </Box>
      <Text
        color="gray7"
        margin={{ left: "xxsmall" }}
        size="component"
        style={overflowStyle}
      >
        {branch}
      </Text>
    </Box>
  );
}
