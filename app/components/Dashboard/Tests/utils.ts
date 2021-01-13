import { Checkmark, Close, IconProps } from "grommet-icons";
import { ComponentType } from "react";

import {
  GroupTests,
  RunStatus,
  SelectedTest,
  Suite,
  SuiteRun,
  TestWithSummary,
} from "../../../lib/types";
import { copy } from "../../../theme/copy";
import Paw from "../../shared/icons/Paw";

type FormatGroupTrigger = {
  repeatMinutes?: number | null;
  repoName?: string | null;
  skipOwnerInRepoName?: boolean;
};

type GetSelectedTests = {
  runs: SuiteRun[] | null;
  selectedIds: string[];
  tests: TestWithSummary[] | null;
};

const countRunsForStatus = ({ runs }: Suite, status: RunStatus): number => {
  return runs.filter((suiteRun) => suiteRun.status === status).length;
};

export const formatGroupTrigger = ({
  repeatMinutes,
  repoName,
  skipOwnerInRepoName,
}: FormatGroupTrigger): string => {
  if (repoName) {
    const formattedRepoName = skipOwnerInRepoName
      ? repoName.split("/")[1]
      : repoName;
    return `Run on deployment: ${formattedRepoName}`;
  }

  if (!repeatMinutes) return "No trigger";
  if (repeatMinutes === 60 * 24) return "Run every day";
  if (repeatMinutes === 60) return "Run every hour";

  const hours = Math.floor(repeatMinutes / 60);
  return `Run every ${hours} hours`;
};

export const getGroupTests = (tests?: TestWithSummary[]): GroupTests => {
  if (!tests) return {};
  const groupTests: GroupTests = {};

  tests.forEach(({ groups, id }) => {
    groupTests[id] = groups.map((group) => group.id);
  });

  return groupTests;
};

export const getSelectedTests = ({
  runs,
  selectedIds,
  tests,
}: GetSelectedTests): SelectedTest[] => {
  if (!runs && !tests) return [];

  const selectedTests: SelectedTest[] = [];

  if (tests) {
    tests.forEach(({ id, name }) => {
      if (selectedIds.includes(id)) {
        selectedTests.push({ id, name });
      }
    });
  } else if (runs) {
    runs.forEach(({ test_id, test_name }) => {
      if (selectedIds.includes(test_id)) {
        selectedTests.push({ id: test_id, name: test_name });
      }
    });
  }

  return selectedTests;
};

const isFailed = ({ runs }: Suite): boolean => {
  const failRun = runs.find((suiteRun) => suiteRun.status === "fail");
  return !!failRun;
};

export const isInProgress = ({ runs }: Suite): boolean => {
  const inProgressRun = runs.find((suiteRun) => suiteRun.status === "created");
  return !!inProgressRun;
};

export const getHeadlineForSuite = (suite: Suite): string => {
  const counts: string[] = [];

  const failCount = countRunsForStatus(suite, "fail");
  if (failCount) counts.push(`${failCount} ${copy.testFail}`);

  const passCount = countRunsForStatus(suite, "pass");
  if (passCount) counts.push(`${passCount} ${copy.testPass}`);

  const inProgressCount = countRunsForStatus(suite, "created");
  if (inProgressCount) counts.push(`${inProgressCount} ${copy.testInProgress}`);

  return counts.join(", ");
};

export const getIconForStatus = (
  status: RunStatus
): ComponentType<IconProps> => {
  if (status === "created") return Paw;
  if (status === "fail") return Close;

  return Checkmark;
};

export const getStatusForSuite = (suite: Suite): RunStatus => {
  if (isInProgress(suite)) return "created";
  if (isFailed(suite)) return "fail";

  return "pass";
};
