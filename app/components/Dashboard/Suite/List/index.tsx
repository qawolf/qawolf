import { Box } from "grommet";

import { RunStatus, SuiteRun } from "../../../../lib/types";
import { borderSize } from "../../../../theme/theme-new";
import { filterRuns } from "../../helpers";
import Header from "./Header";
import RunCard from "./RunCard";

type Props = {
  runs: SuiteRun[];
  search: string;
  status: RunStatus | null;
};

export default function List({ runs, search, status }: Props): JSX.Element {
  const filteredRuns = filterRuns({ runs, search, status });

  const runsHtml = filteredRuns.map((run, i) => {
    return <RunCard key={run.id} noBorder={!i} run={run} />;
  });

  return (
    <Box
      border={{ color: "gray3", size: borderSize.xsmall }}
      margin={{ top: "medium" }}
      round={borderSize.small}
    >
      <Header runs={filteredRuns} />
      <Box overflow={{ vertical: "scroll" }}>
        <Box flex={false}>{runsHtml}</Box>
      </Box>
    </Box>
  );
}
