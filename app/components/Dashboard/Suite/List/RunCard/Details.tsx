import { Box } from "grommet";

import { durationToText } from "../../../../../lib/helpers";
import { SuiteRun } from "../../../../../lib/types";
import { copy } from "../../../../../theme/copy";
import { colors, edgeSize } from "../../../../../theme/theme";
import Timer from "../../../../shared/icons/Timer";
import Text from "../../../../shared/Text";

type Props = { run: SuiteRun };

const iconProps = {
  color: colors.gray7,
  size: edgeSize.small,
};

const textProps = {
  color: colors.gray7,
  margin: { left: "xxxsmall" },
  size: "component" as const,
};

export default function Details({ run }: Props): JSX.Element {
  let duration = copy.notStarted;

  if (run.started_at && run.completed_at) {
    duration = durationToText(run.started_at, run.completed_at);
  } else if (run.started_at) {
    duration = copy.inProgress;
  }

  return (
    <Box align="center" direction="row" flex={false} pad={{ left: "small" }}>
      <Timer {...iconProps} />
      <Text {...textProps}>{duration}</Text>
    </Box>
  );
}
