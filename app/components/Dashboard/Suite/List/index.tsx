import { Box } from "grommet";
import { useRouter } from "next/router";

import { RunStatus, SuiteRun } from "../../../../lib/types";
import { borderSize } from "../../../../theme/theme-new";
import { filterRuns } from "../../helpers";
import Header from "./Header";
import RunCard from "./RunCard";

type Props = {
  checkedTestIds: string[];
  runs: SuiteRun[];
  search: string;
  setCheckedTestIds: (runIds: string[]) => void;
};

export default function List({
  checkedTestIds,
  runs,
  search,
  setCheckedTestIds,
}: Props): JSX.Element {
  const { query } = useRouter();
  const status = (query.status || null) as RunStatus | null;

  const handleRunCheck = (testId: string): void => {
    const index = checkedTestIds.indexOf(testId);
    if (index > -1) {
      const newSelectedTestIds = [...checkedTestIds];
      newSelectedTestIds.splice(index, 1);

      setCheckedTestIds(newSelectedTestIds);
    } else {
      setCheckedTestIds([...checkedTestIds, testId]);
    }
  };

  const filteredRuns = filterRuns({ runs, search, status });

  const runsHtml = filteredRuns.map((run, i) => {
    return (
      <RunCard
        isChecked={checkedTestIds.includes(run.test_id)}
        key={run.id}
        noBorder={!i}
        onCheck={() => handleRunCheck(run.test_id)}
        run={run}
      />
    );
  });

  return (
    <Box
      border={{ color: "gray3", size: borderSize.xsmall }}
      margin={{ top: "medium" }}
      round={borderSize.small}
    >
      <Header
        checkedTestIds={checkedTestIds}
        runs={filteredRuns}
        setCheckedTestIds={setCheckedTestIds}
      />
      <Box overflow={{ vertical: "scroll" }}>
        <Box flex={false}>{runsHtml}</Box>
      </Box>
    </Box>
  );
}
