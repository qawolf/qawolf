import { timeToText } from "../../lib/helpers";
import { routes } from "../../lib/routes";
import {
  RunStatus,
  ShortSuite,
  ShortTest,
  SuiteRun,
  SuiteSummary,
  TagsForTest,
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
  search: string;
  tagIds: string[];
  testTags: TagsForTest[] | null;
  tests: ShortTest[] | null;
};

export const noTagId = "noTag";

export const buildTestsPath = (triggerId: string | null): string => {
  const query = triggerId ? `?trigger_id=${triggerId}` : "";

  return `${routes.tests}${query}`;
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

// TODO: support and not just or
export const filterTests = ({
  search,
  tagIds,
  testTags,
  tests,
}: FilterTests): ShortTest[] | null => {
  if (!tests || (tagIds.length && !testTags)) return null;

  let filteredTests = [...tests];
  const includeNoTags = tagIds.includes(noTagId);

  if (search) {
    filteredTests = filteredTests.filter((t) => {
      const testName = t.name || t.path;
      return testName.toLowerCase().includes(search.toLowerCase());
    });
  }

  if (tagIds.length) {
    filteredTests = filteredTests.filter((test) => {
      const tags = testTags.find((t) => t.test_id === test.id)?.tags || [];

      if (includeNoTags && !tags.length) return true;
      return tags.some((t) => tagIds.includes(t.id));
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
