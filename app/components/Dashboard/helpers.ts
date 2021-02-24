import { timeToText } from "../../lib/helpers";
import {
  RunStatus,
  ShortTest,
  TestSummaryRun,
  TestTriggers,
} from "../../lib/types";
import { copy } from "../../theme/copy";

type FilterTests = {
  search: string;
  testTriggers?: TestTriggers[];
  tests?: ShortTest[];
  trigger_id?: string | null;
};

export const noTriggerId = "none";

export const filterTests = ({
  search,
  testTriggers,
  tests,
  trigger_id,
}: FilterTests): ShortTest[] | null => {
  if (!tests || (trigger_id && !testTriggers)) return null;

  let filteredTests = [...tests];

  if (search) {
    filteredTests = filteredTests.filter((t) => {
      return t.name.toLowerCase().includes(search.toLowerCase());
    });
  }

  if (trigger_id === noTriggerId) {
    filteredTests = filteredTests.filter((test) => {
      const triggerIds =
        testTriggers.find((t) => t.test_id === test.id)?.trigger_ids || [];

      return !triggerIds.length;
    });
  } else if (trigger_id) {
    filteredTests = filteredTests.filter((test) => {
      const triggerIds =
        testTriggers.find((t) => t.test_id === test.id)?.trigger_ids || [];

      return triggerIds.includes(trigger_id);
    });
  }

  return filteredTests;
};

export const getLabelForRun = (run: TestSummaryRun): string => {
  let prefix = copy.testInProgress;
  if (run.status === "pass") prefix = copy.testPass;
  if (run.status === "fail") prefix = copy.testFail;

  return `${prefix}: ${timeToText(run.created_at)}`;
};

export const getLabelForStatus = (status: RunStatus | null): string => {
  if (status === "created") return copy.testInProgress;
  if (status === "fail") return copy.testFail;
  if (status === "pass") return copy.testPass;

  return copy.allStatuses;
};
