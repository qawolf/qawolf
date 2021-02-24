import { Box } from "grommet";

import { RunStatus, SuiteRun } from "../../../../lib/types";
import { borderSize } from "../../../../theme/theme-new";
import { filterRuns } from "../../helpers";
import Header from "./Header";

type Props = {
  runs: SuiteRun[];
  search: string;
  status: RunStatus | null;
};

export default function List({ runs, search, status }: Props): JSX.Element {
  const filteredRuns = filterRuns({ runs, search, status });

  return (
    <Box
      border={{ color: "gray3", size: borderSize.xsmall }}
      margin={{ top: "medium" }}
      round={borderSize.small}
    >
      <Header runs={filteredRuns} />
    </Box>
  );
}
