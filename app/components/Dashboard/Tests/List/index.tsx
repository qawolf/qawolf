import { Box } from "grommet";

import { ShortTest, TestTriggers, Trigger } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import { borderSize } from "../../../../theme/theme-new";
import Spinner from "../../../shared/Spinner";
import Text from "../../../shared-new/Text";
import TestCard from "./TestCard";

type Props = {
  checkedTestIds: string[];
  onTestCheck: (testId: string) => void;
  tests: ShortTest[] | null;
  testTriggers: TestTriggers[];
  triggers: Trigger[];
};

const border = { color: "gray3", size: borderSize.xsmall };

export default function List({
  checkedTestIds,
  onTestCheck,
  tests,
  testTriggers,
  triggers,
}: Props): JSX.Element {
  if (!tests) return <Spinner />;

  const testsHtml = tests.map((test, i) => {
    const triggerIds =
      testTriggers.find((t) => t.test_id === test.id)?.trigger_ids || [];
    const filteredTriggers = triggers.filter((t) => triggerIds.includes(t.id));

    return (
      <TestCard
        isChecked={checkedTestIds.includes(test.id)}
        key={test.id}
        noBorder={!i}
        onCheck={() => onTestCheck(test.id)}
        test={test}
        triggers={filteredTriggers}
      />
    );
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
