import { Box } from "grommet";

import { ShortTest, Trigger } from "../../../../../lib/types";
import { borderSize } from "../../../../../theme/theme-new";
import CheckBox from "../../../../shared-new/CheckBox";
import Text from "../../../../shared-new/Text";
import RunBars from "./RunBars";
import TestGif from "./TestGif";
import Triggers from "./Triggers";

type Props = {
  isChecked: boolean;
  noBorder?: boolean;
  onCheck: () => void;
  test: ShortTest;
  triggers: Trigger[];
};

export default function TestCard({
  isChecked,
  noBorder,
  onCheck,
  test,
  triggers,
}: Props): JSX.Element {
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
          gifUrl={test.summary.gif_url}
          isRunning={test.summary.last_runs.length && !test.summary.gif_url}
          testName={test.name}
        />
        <RunBars runs={test.summary.last_runs} />
        <Text color="gray9" size="componentMedium">
          {test.name}
        </Text>
      </Box>
      <Triggers triggers={triggers} />
    </Box>
  );
}
