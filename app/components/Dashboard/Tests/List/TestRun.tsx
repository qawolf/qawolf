import { Box } from "grommet";
import { Calendar, Clock } from "grommet-icons";

import { durationToText, timeToText } from "../../../../lib/helpers";
import { SuiteRun } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import { colors, iconSize } from "../../../../theme/theme";
import Text from "../../../shared/Text";
import StatusIcon from "../StatusIcon";

type Props = { run: SuiteRun };

const iconProps = { color: colors.gray, size: iconSize };
const textProps = {
  color: "gray",
  margin: { left: "small" },
  size: "small",
};

export default function TestRun({ run }: Props): JSX.Element {
  const timestamp = run.started_at
    ? timeToText(run.started_at)
    : copy.notStarted;

  let duration = copy.notStarted;
  if (run.started_at && run.completed_at) {
    duration = durationToText(run.started_at, run.completed_at);
  } else if (run.started_at) {
    duration = copy.inProgress;
  }

  return (
    <Box direction="row" flex={false}>
      <Box justify="between" margin={{ right: "medium" }}>
        <Box direction="row">
          <Calendar {...iconProps} />
          <Text {...textProps}>{timestamp}</Text>
        </Box>
        <Box direction="row">
          <Clock {...iconProps} />
          <Text {...textProps}>{duration}</Text>
        </Box>
      </Box>
      <StatusIcon status={run.status} />
    </Box>
  );
}
