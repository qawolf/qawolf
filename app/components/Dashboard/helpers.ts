import { timeToText } from "../../lib/helpers";
import { routes } from "../../lib/routes";
import {
  RunStatus,
  ShortSuite,
  ShortTest,
  SuiteRun,
  SuiteSummary,
  TagFilter,
  TagsForTest,
  TestSummaryRun,
} from "../../lib/types";
import { copy } from "../../theme/copy";

type FilterRuns = {
  runs: SuiteRun[];
  search: string;
  status: RunStatus | null;
};

type FilterTests = {
  filter: TagFilter;
  search: string;
  tagNames: string[];
  testTags: TagsForTest[] | null;
  tests: ShortTest[] | null;
};

export const noTagName = "noTag";

export const buildTestsPath = (
  tagNames: string[],
  filter?: TagFilter
): string => {
  const queryParts: string[] = [];

  if (filter === "all") queryParts.push("filter=all");
  if (tagNames.length) queryParts.push(`tags=${tagNames.join(",")}`);

  const formattedQuery = queryParts.length ? `?${queryParts.join("&")}` : "";

  return `${routes.tests}${formattedQuery}`;
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
  filter,
  search,
  tagNames,
  testTags,
  tests,
}: FilterTests): ShortTest[] | null => {
  if (!tests || (tagNames.length && !testTags)) return null;

  let filteredTests = [...tests];
  const includeNoTags = tagNames.includes(noTagName);

  if (search) {
    filteredTests = filteredTests.filter((t) => {
      const testName = t.name || t.path;
      return testName.toLowerCase().includes(search.toLowerCase());
    });
  }

  if (tagNames.length) {
    filteredTests = filteredTests.filter((test) => {
      const tags = testTags.find((t) => t.test_id === test.id)?.tags || [];

      if (includeNoTags && !tags.length) {
        return filter === "all" ? tagNames.length === 1 : true;
      }

      if (filter === "all") {
        return tagNames.every((tagName) =>
          tags.some((tag) => tag.name === tagName)
        );
      }
      return tags.some((t) => tagNames.includes(t.name));
    });
  }

  return filteredTests;
};

export const formatSuiteName = (suite: ShortSuite): string => {
  if (suite.trigger?.name) return suite.trigger.name;

  const environment = suite.environment_name
    ? `: ${suite.environment_name}`
    : "";
  const label = suite.is_api ? copy.apiTriggered : copy.manuallyTriggered;

  return `${suite.tag_names || label}${environment}`;
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
