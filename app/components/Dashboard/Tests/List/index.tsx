import { Box } from "grommet";

import { ShortTest, TestTriggers, Trigger } from "../../../../lib/types";
import { borderSize } from "../../../../theme/theme-new";
import Spinner from "../../../shared/Spinner";
import Header from "./Header";
import TestCard from "./TestCard";

type Props = {
  checkedTestIds: string[];
  setCheckedTestIds: (testIds: string[]) => void;
  tests: ShortTest[] | null;
  testTriggers: TestTriggers[];
  triggers: Trigger[];
};

export default function List({
  checkedTestIds,
  setCheckedTestIds,
  tests,
  testTriggers,
  triggers,
}: Props): JSX.Element {
  if (!tests) return <Spinner />;

  const handleTestCheck = (testId: string): void => {
    const index = checkedTestIds.indexOf(testId);
    if (index > -1) {
      const newSelectedTestIds = [...checkedTestIds];
      newSelectedTestIds.splice(index, 1);

      setCheckedTestIds(newSelectedTestIds);
    } else {
      setCheckedTestIds([...checkedTestIds, testId]);
    }
  };

  const testsHtml = tests.map((test, i) => {
    const triggerIds =
      testTriggers.find((t) => t.test_id === test.id)?.trigger_ids || [];
    const filteredTriggers = triggers.filter((t) => triggerIds.includes(t.id));

    return (
      <TestCard
        isChecked={checkedTestIds.includes(test.id)}
        key={test.id}
        noBorder={!i}
        onCheck={() => handleTestCheck(test.id)}
        test={test}
        triggers={filteredTriggers}
      />
    );
  });

  return (
    <Box
      border={{ color: "gray3", size: borderSize.xsmall }}
      margin={{ top: "medium" }}
      round={borderSize.small}
    >
      <Header
        checkedTestIds={checkedTestIds}
        setCheckedTestIds={setCheckedTestIds}
        tests={tests}
      />
      <Box overflow={{ vertical: "scroll" }}>
        <Box flex={false}>{testsHtml}</Box>
      </Box>
    </Box>
  );
}
