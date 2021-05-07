import { Box } from "grommet";

import { useTestSummaries } from "../../../../hooks/queries";
import { ShortTest, TagsForTest } from "../../../../lib/types";
import Spinner from "../../../shared/Spinner";
import Header from "./Header";
import TestCard from "./TestCard";

type Props = {
  checkedTestIds: string[];
  setCheckedTestIds: (testIds: string[]) => void;
  testIds: string[];
  testTags: TagsForTest[];
  tests: ShortTest[] | null;
};

export default function List({
  checkedTestIds,
  setCheckedTestIds,
  testIds,
  testTags,
  tests,
}: Props): JSX.Element {
  const { data, loading } = useTestSummaries(
    {
      // tests includes only filtered tests, so do not rerun query just if search changes
      test_ids: testIds,
      trigger_id: null, // TODO: remove
    },
    { pollInterval: 10 * 1000 }
  );

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

  const testsHtml = tests.map((test) => {
    const tags = testTags.find((t) => t.test_id === test.id)?.tags || [];

    const summary = (data?.testSummaries || []).find(
      (s) => s.test_id === test.id
    );

    return (
      <TestCard
        isChecked={checkedTestIds.includes(test.id)}
        isSummaryLoading={loading}
        key={test.id}
        onCheck={() => handleTestCheck(test.id)}
        summary={summary || null}
        tags={tags}
        test={test}
      />
    );
  });

  return (
    <>
      <Header
        checkedTestIds={checkedTestIds}
        setCheckedTestIds={setCheckedTestIds}
        tests={tests}
      />
      <Box overflow={{ vertical: "auto" }}>
        <Box flex={false}>{testsHtml}</Box>
      </Box>
    </>
  );
}
