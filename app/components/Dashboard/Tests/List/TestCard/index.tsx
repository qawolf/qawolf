import { Box } from "grommet";
import Link from "next/link";

import { routes } from "../../../../../lib/routes";
import { ShortTest, TestSummary, Trigger } from "../../../../../lib/types";
import { border } from "../../../../../theme/theme";
import CheckBox from "../../../../shared/CheckBox";
import TestGif from "../../../../shared/TestGif";
import Options from "./Options";
import RunBars from "./RunBars";
import TestName from "./TestName";
import Triggers from "./Triggers";

type Props = {
  groupName: string | null;
  hasGroups: boolean;
  isChecked: boolean;
  isSummaryLoading: boolean;
  noBorder?: boolean;
  onCheck: () => void;
  summary: TestSummary | null;
  test: ShortTest;
  triggers: Trigger[];
};

export default function TestCard({
  groupName,
  hasGroups,
  isChecked,
  isSummaryLoading,
  noBorder,
  onCheck,
  summary,
  test,
  triggers,
}: Props): JSX.Element {
  const runs = summary?.last_runs || null;
  const testName = test.name || test.path;

  return (
    <Box
      align="center"
      border={noBorder ? undefined : { ...border, side: "top" }}
      direction="row"
      justify="between"
      pad={{ horizontal: "small" }}
    >
      <Box align="center" direction="row" fill="horizontal">
        <Box flex={false} margin={{ right: "small" }}>
          <CheckBox
            a11yTitle={testName}
            checked={isChecked}
            onChange={onCheck}
          />
        </Box>
        <Box fill="horizontal">
          <Link href={`${routes.test}/${test.id}`}>
            <a>
              <Box
                align="center"
                direction="row"
                fill="horizontal"
                pad={{ vertical: "small" }}
              >
                <TestGif
                  gifUrl={summary?.gif_url}
                  isLoading={isSummaryLoading}
                  isRunning={!!runs?.length && !runs[0].gif_url}
                  testName={testName}
                />
                <TestName groupName={groupName} testName={testName} />
              </Box>
            </a>
          </Link>
        </Box>
      </Box>
      <Box align="center" direction="row" flex={false}>
        <Triggers triggers={triggers} />
        <RunBars runs={runs} />
        <Options hasGroups={hasGroups} test={test} />
      </Box>
    </Box>
  );
}
