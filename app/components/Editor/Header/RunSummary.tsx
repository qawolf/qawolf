import { Box } from "grommet";

import { durationToText, timestampToText } from "../../../lib/helpers";
import { Run, Suite } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { borderSize, colors, edgeSize } from "../../../theme/theme";
import GitBranch from "../../shared/GitBranch";
import GitCommit from "../../shared/GitCommit";
import LabeledBox from "../../shared/LabeledBox";
import StatusBadge from "../../shared/StatusBadge";
import Text from "../../shared/Text";
import TriggerBadge from "../../shared/TriggerBadge";

type Props = {
  run: Run;
  suite: Suite | null;
};

const textProps = {
  color: "gray9",
  size: "component" as const,
};

export default function RunSummary({ run, suite }: Props): JSX.Element {
  const startedAt = run.started_at
    ? timestampToText(run.started_at)
    : copy.notStarted;

  let duration = copy.notStarted;

  if (run.started_at && run.completed_at) {
    duration = durationToText(run.started_at, run.completed_at);
  } else if (run.started_at) {
    duration = copy.inProgress;
  }

  return (
    <Box
      border={{ color: "gray3", side: "bottom", size: borderSize.xsmall }}
      direction="row"
      flex={false}
      gap={edgeSize.large}
      pad="small"
    >
      <LabeledBox label={copy.trigger}>
        <TriggerBadge suite={suite} />
      </LabeledBox>
      <LabeledBox label={copy.status}>
        <StatusBadge status={run.status} />
      </LabeledBox>
      <LabeledBox label={copy.startedAt}>
        <Text {...textProps}>{startedAt}</Text>
      </LabeledBox>
      <LabeledBox label={copy.duration}>
        <Text {...textProps}>{duration}</Text>
      </LabeledBox>
      {!!suite.commit_url && (
        <LabeledBox label={copy.commit}>
          <GitCommit
            color={colors.gray9}
            commitUrl={suite.commit_url}
            isLink
            margin={{}}
          />
        </LabeledBox>
      )}
      {!!suite.branch && (
        <LabeledBox label={copy.branch}>
          <GitBranch branch={suite.branch} color={colors.gray9} margin={{}} />
        </LabeledBox>
      )}
    </Box>
  );
}
