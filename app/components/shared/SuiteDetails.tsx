import { Box, BoxProps } from "grommet";

import { timestampToText } from "../../lib/helpers";
import { Suite, SuiteSummary } from "../../lib/types";
import GitBranch from "./GitBranch";
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
      <GitBranch branch={suite.branch} />
    </Box>
  );
}
