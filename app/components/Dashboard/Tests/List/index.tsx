import { Box } from "grommet";

import { ShortTest } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import { borderSize } from "../../../../theme/theme-new";
import Spinner from "../../../shared/Spinner";
import Text from "../../../shared-new/Text";
import TestCard from "./TestCard";

type Props = { tests: ShortTest[] | null };

const border = { color: "gray3", size: borderSize.xsmall };

export default function List({ tests }: Props): JSX.Element {
  if (!tests) return <Spinner />;

  const testsHtml = tests.map((test, i) => {
    return <TestCard key={test.id} noBorder={!i} test={test} />;
  });

  return (
    <Box border={border} margin={{ top: "medium" }} round={borderSize.small}>
      <Box
        background="gray1"
        border={tests.length ? { ...border, side: "bottom" } : undefined}
        flex={false}
        pad="small"
      >
        <Text color="gray9" size="componentBold">
          {copy.testCount(tests.length)}
        </Text>
      </Box>
      <Box overflow={{ vertical: "scroll" }}>
        <Box flex={false}>{testsHtml}</Box>
      </Box>
    </Box>
  );
}
