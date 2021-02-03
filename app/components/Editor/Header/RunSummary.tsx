import { Box } from "grommet";
import { durationToText, timeToText } from "../../../lib/helpers";
import { Run } from "../../../lib/types";
import { copy } from "../../../theme/copy";

import Text from "../../shared-new/Text";

type Props = { run: Run };

const textProps = {
  color: "gray9",
  size: "component" as const,
};

export default function RunSummary({ run }: Props): JSX.Element {
  let duration = run.started_at
    ? durationToText(
        run.started_at,
        run.completed_at || new Date().toISOString()
      )
    : copy.notStarted;

  return (
    <Box direction="row" margin={{ right: "small" }}>
      <Text {...textProps} margin={{ right: "small" }}>
        {timeToText(run.started_at)}
      </Text>
      <Text {...textProps}>{duration}</Text>
    </Box>
  );
}
