import { Box } from "grommet";

import { Suite, SuiteRun } from "../../../../lib/types";
import Header from "./Header";
import RunCard from "./RunCard";

type Props = {
  checkedTestIds: string[];
  runs: SuiteRun[];
  setCheckedTestIds: (runIds: string[]) => void;
  suite: Suite;
};

export default function List({
  checkedTestIds,
  runs,
  setCheckedTestIds,
  suite,
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

  const runsHtml = runs.map((run) => {
    return (
      <RunCard
        isChecked={checkedTestIds.includes(run.test_id)}
        key={run.id}
        onCheck={() => handleRunCheck(run.test_id)}
        run={run}
      />
    );
  });

  return (
    <>
      <Header
        checkedTestIds={checkedTestIds}
        runs={runs}
        setCheckedTestIds={setCheckedTestIds}
        suite={suite}
      />
      <Box overflow={{ vertical: "auto" }}>
        <Box flex={false}>{runsHtml}</Box>
      </Box>
    </>
  );
}
