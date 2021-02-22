import { Box } from "grommet";

import { TestSummaryRun } from "../../../../../lib/types";
import RunBar from "./RunBar";
import RunBarEmpty from "./RunBarEmpty";

type Props = { runs: TestSummaryRun[] | null };

const gap = "6px";
const runCount = 5;

export default function RunBars({ runs }: Props): JSX.Element {
  const innerHtml = (runs || []).map((run) => {
    return <RunBar key={run.id} run={run} />;
  });

  const missingRunCount = runCount - innerHtml.length;
  for (let i = 0; i < missingRunCount; i++) {
    innerHtml.push(<RunBarEmpty key={i} />);
  }

  return (
    <Box
      direction="row-reverse"
      gap={gap}
      margin={{ left: "medium", right: "small" }}
    >
      {innerHtml}
    </Box>
  );
}
