import { Box } from "grommet";

import { SuiteRun } from "../../../../lib/types";
import { borderSize } from "../../../../theme/theme-new";
import Header from "./Header";
import RunCard from "./RunCard";

type Props = {
  checkedTestIds: string[];
  runs: SuiteRun[];
  setCheckedTestIds: (runIds: string[]) => void;
};

export default function List({
  checkedTestIds,
  runs,
  setCheckedTestIds,
}: Props): JSX.Element {
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

  const runsHtml = runs.map((run, i) => {
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
        runs={runs}
        setCheckedTestIds={setCheckedTestIds}
      />
      <Box overflow={{ vertical: "auto" }}>
        <Box flex={false}>{runsHtml}</Box>
      </Box>
    </Box>
  );
}
