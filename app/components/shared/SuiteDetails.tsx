import { Box, BoxProps } from "grommet";

import { timestampToText } from "../../lib/helpers";
import { Suite, SuiteSummary } from "../../lib/types";
import GitBranch from "./GitBranch";
import GitCommit from "./GitCommit";
import Text from "./Text";

type Props = {
  isCommitLink?: boolean;
  margin?: BoxProps["margin"];
  suite: Suite | SuiteSummary;
};

export default function SuiteDetails({
  isCommitLink,
  margin,
  suite,
}: Props): JSX.Element {
  return (
    <Box align="center" direction="row" margin={margin}>
      <GitCommit
        commitUrl={suite.commit_url}
        isLink={isCommitLink}
        margin={{ right: "small" }}
      />
      <GitBranch branch={suite.branch} margin={{ right: "small" }} />
      <Text color="gray7" size="component">
        {timestampToText(suite.created_at)}
      </Text>
    </Box>
  );
}
