import { Box } from "grommet";
import Link from "next/link";

import { routes } from "../../../../../lib/routes";
import { ShortTest, TestSummary, Trigger } from "../../../../../lib/types";
import { borderSize, overflowStyle } from "../../../../../theme/theme-new";
import CheckBox from "../../../../shared-new/CheckBox";
import Text from "../../../../shared-new/Text";
import RunBars from "./RunBars";
import TestGif from "./TestGif";
import Triggers from "./Triggers";

type Props = {
  isChecked: boolean;
  isSummaryLoading: boolean;
  noBorder?: boolean;
  onCheck: () => void;
  summary: TestSummary | null;
  test: ShortTest;
  triggers: Trigger[];
};

export default function TestCard({
  isChecked,
  isSummaryLoading,
  noBorder,
  onCheck,
  summary,
  test,
  triggers,
}: Props): JSX.Element {
  const runs = summary?.last_runs || null;

  return (
    <Box
      align="center"
      border={
        noBorder
          ? undefined
          : { color: "gray3", side: "top", size: borderSize.xsmall }
      }
      direction="row"
      justify="between"
      pad={{ horizontal: "small" }}
    >
      <Box align="center" direction="row" fill="horizontal">
        <Box flex={false} margin={{ right: "small" }}>
          <CheckBox
            a11yTitle={test.name}
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
                  testName={test.name}
                />
                <Text
                  color="gray9"
                  margin={{ left: "small" }}
                  size="componentMedium"
                  style={overflowStyle}
                >
                  {test.name}
                </Text>
              </Box>
            </a>
          </Link>
        </Box>
      </Box>
      <Box align="center" direction="row" flex={false}>
        <Triggers triggers={triggers} />
        <RunBars runs={runs} />
      </Box>
    </Box>
  );
}
