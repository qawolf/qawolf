import { Box } from "grommet";

import { ShortTest, TestSummary, Trigger } from "../../../../../lib/types";
import { borderSize } from "../../../../../theme/theme-new";
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
      pad="small"
    >
      <Box align="center" direction="row" flex={false}>
        <CheckBox
          a11yTitle={test.name}
          checked={isChecked}
          onChange={onCheck}
        />
        <TestGif
          gifUrl={null}
          isLoading={isSummaryLoading}
          isRunning={runs?.length && !summary?.gif_url}
          testName={test.name}
        />
        <Text color="gray9" margin={{ left: "small" }} size="componentMedium">
          {test.name}
        </Text>
      </Box>
      <Box align="center" direction="row">
        <Triggers triggers={triggers} />
        {/* <RunBars runs={runs} /> */}
      </Box>
    </Box>
  );
}
