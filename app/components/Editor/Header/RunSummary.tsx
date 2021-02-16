import { Box } from "grommet";

import { durationToText, timestampToText } from "../../../lib/helpers";
import { Run } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { borderSize } from "../../../theme/theme-new";
import LabeledBox from "../../shared-new/LabeledBox";
import StatusBadge from "../../shared-new/StatusBadge";
import Text from "../../shared-new/Text";
import TriggerBadge from "../../shared-new/TriggerBadge";

type Props = { run: Run };

const rightMargin = { right: "large" };

export default function RunSummary({ run }: Props): JSX.Element {
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
      pad="small"
    >
      <LabeledBox label={copy.trigger} margin={rightMargin}>
        <TriggerBadge suiteId={run.suite_id} />
      </LabeledBox>
      <LabeledBox label={copy.status} margin={rightMargin}>
        <StatusBadge status={run.status} />
      </LabeledBox>
      <LabeledBox label={copy.startedAt} margin={rightMargin}>
        <Text color="gray9" size="component">
          {startedAt}
        </Text>
      </LabeledBox>
      <LabeledBox label={copy.duration}>
        <Text color="gray9" size="component">
          {duration}
        </Text>
      </LabeledBox>
    </Box>
  );
}
