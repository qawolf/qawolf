import { Box, BoxProps } from "grommet";
import { RiGitBranchLine } from "react-icons/ri";

import { timestampToText } from "../../lib/helpers";
import { Suite, SuiteSummary } from "../../lib/types";
import { colors, edgeSize } from "../../theme/theme";
import Text from "./Text";

type Props = {
  margin?: BoxProps["margin"];
  suite: Suite | SuiteSummary;
};

export default function SuiteDetails({ margin, suite }: Props): JSX.Element {
  return (
    <Box align="center" direction="row" margin={margin}>
      <Text color="gray7" size="component">
        {timestampToText(suite.created_at)}
      </Text>
      {!!suite.branch && (
        <Box align="center" direction="row" margin={{ left: "small" }}>
          <RiGitBranchLine color={colors.gray7} size={edgeSize.small} />
          <Text color="gray7" margin={{ left: "xxsmall" }} size="component">
            {suite.branch}
          </Text>
        </Box>
      )}
    </Box>
  );
}
