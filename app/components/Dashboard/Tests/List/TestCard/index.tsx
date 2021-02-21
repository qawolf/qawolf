import { Box } from "grommet";

import { ShortTest } from "../../../../../lib/types";
import { borderSize } from "../../../../../theme/theme-new";
import Text from "../../../../shared-new/Text";
import RunBars from "./RunBars";
import TestGif from "./TestGif";

type Props = {
  noBorder?: boolean;
  test: ShortTest;
};

export default function TestCard({ noBorder, test }: Props): JSX.Element {
  return (
    <Box
      border={
        noBorder
          ? undefined
          : { color: "gray3", side: "top", size: borderSize.xsmall }
      }
      pad="small"
    >
      <Box align="center" direction="row">
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
    </Box>
  );
}
