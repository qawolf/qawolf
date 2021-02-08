import { Box } from "grommet";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import {
  SuiteRun,
  TestWithSummary,
  TestTriggers,
  Trigger,
} from "../../../../lib/types";
import { getSelectedTests } from "../utils";
import Actions from "./Actions";
import ListItems from "./ListItems";

type Props = {
  isLoading: boolean;
  runs: SuiteRun[] | null;
  selectedIds: string[];
  selectedTriggerId: string;
  setSelectedIds: Dispatch<SetStateAction<string[]>>;
  testTriggers: TestTriggers;
  tests: TestWithSummary[] | null;
  triggers: Trigger[];
  wolfVariant: string;
};

export default function List({
  isLoading,
  runs,
  selectedIds,
  selectedTriggerId,
  setSelectedIds,
  testTriggers,
  tests,
  triggers,
  wolfVariant,
}: Props): JSX.Element {
  const { query } = useRouter();
  const suiteId = (query.suite_id as string) || null;

  const [search, setSearch] = useState("");

  // reset check boxes when trigger or suite changes
  useEffect(() => {
    setSelectedIds([]);
  }, [selectedTriggerId, setSelectedIds, suiteId]);

  const selectableRuns = runs?.filter((run) => !run.is_test_deleted) || null;

  const handleAllCheck = () => {
    setSelectedIds((prev) => {
      if (tests && prev.length !== tests.length) {
        return tests.map((test) => test.id);
      }

      if (selectableRuns && prev.length !== selectableRuns.length) {
        return selectableRuns.map((run) => run.test_id);
      }

      return [];
    });
  };

  const handleCheck = (testId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(testId)) {
        return prev.filter((id) => id !== testId);
      }

      return [...prev, testId];
    });
  };

  let isChecked = false;
  if (tests && tests.length) {
    isChecked = selectedIds.length === tests.length;
  } else if (selectableRuns && selectableRuns.length) {
    isChecked = selectedIds.length === selectableRuns.length;
  }

  const selectedTests = getSelectedTests({ runs, selectedIds, tests });

  return (
    <Box fill>
      <Actions
        isChecked={isChecked}
        onCheck={handleAllCheck}
        search={search}
        selectedTests={selectedTests}
        setSearch={setSearch}
        testTriggers={testTriggers}
        triggers={triggers}
      />
      <ListItems
        isLoading={isLoading}
        onCheck={handleCheck}
        runs={runs}
        search={search}
        selectedIds={selectedIds}
        tests={tests}
        wolfVariant={wolfVariant}
      />
    </Box>
  );
}
