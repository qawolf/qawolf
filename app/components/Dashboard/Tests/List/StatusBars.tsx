import { Box } from "grommet";

import { SuiteRun } from "../../../../lib/types";
import StatusBar from "./StatusBar";

type Props = { runs: SuiteRun[] };

export default function StatusBars({ runs }: Props): JSX.Element {
  const reversedRuns = [...runs].reverse();

  const barsHtml = reversedRuns.map((run) => {
    return <StatusBar key={run.id} run={run} />;
  });

  return (
    <Box direction="row" flex={false} justify="end">
      {barsHtml}
    </Box>
  );
}
