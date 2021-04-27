import { timeToText } from "../../lib/helpers";
import { routes } from "../../lib/routes";
import {
  RunStatus,
  ShortSuite,
  ShortTest,
  SuiteRun,
  SuiteSummary,
  TestSummaryRun,
  TestTriggers,
} from "../../lib/types";
import { copy } from "../../theme/copy";

type FilterRuns = {
  runs: SuiteRun[];
  search: string;
  status: RunStatus | null;
};

type FilterTests = {
  group_id: string | null;
  search: string;
  testTriggers?: TestTriggers[];
  tests?: ShortTest[] | null;
  trigger_id?: string | null;
};

export const noTriggerId = "none";

export const buildTestsPath = (
  groupId: string | null,
  triggerId: string | null
): string => {
  const query = triggerId ? `?trigger_id=${triggerId}` : "";

  if (!groupId) return `${routes.tests}${query}`;
  return `${routes.tests}/${groupId}${query}`;
};

export const filterRuns = ({
  runs,
  search,
  status,
}: FilterRuns): SuiteRun[] => {
  let filteredRuns: SuiteRun[] = [...runs];

  if (search) {
    filteredRuns = filteredRuns.filter((r) =>
      r.test_name.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (status) {
    filteredRuns = filteredRuns.filter((r) => r.status === status);
  }

  return filteredRuns;
};

export const filterTests = ({
  group_id,
  search,
  testTriggers,
  tests,
  trigger_id,
}: FilterTests): ShortTest[] | null => {
  if (!tests || (trigger_id && !testTriggers)) return null;

  let filteredTests = [...tests];

  if (group_id) {
    filteredTests = filteredTests.filter((t) => t.group_id === group_id);
  }

  if (search) {
    filteredTests = filteredTests.filter((t) => {
      const testName = t.name || t.path;
      return testName.toLowerCase().includes(search.toLowerCase());
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

export const formatSuiteName = (suite: ShortSuite): string => {
  if (suite.trigger?.name) return suite.trigger.name;
  if (!suite.environment_name) return copy.manuallyTriggered;

  return `${copy.manuallyTriggered}: ${suite.environment_name}`;
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

export const getRunCountForStatus = (
  runs: SuiteRun[],
  status: RunStatus
): number => {
  return runs.filter((r) => r.status === status).length;
};

export const getStatusForSuite = ({
  status_counts,
}: SuiteSummary): RunStatus => {
  if (status_counts.created) return "created";
  if (status_counts.fail) return "fail";

  return "pass";
};
