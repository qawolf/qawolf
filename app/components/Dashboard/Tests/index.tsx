import { Box } from "grommet";
import isEqual from "lodash/isEqual";
import { useRouter } from "next/router";
import { useContext, useEffect, useRef, useState } from "react";

import { useTests, useTestTriggers, useTriggers } from "../../../hooks/queries";
import { StateContext } from "../../StateContext";
import { filterTests } from "../helpers";
import Header from "./Header";
import List from "./List";

export default function Tests(): JSX.Element {
  const { query } = useRouter();
  const trigger_id = query.trigger_id as string;

  const testIdsRef = useRef<string[]>([]);

  const { teamId } = useContext(StateContext);

  const [search, setSearch] = useState("");
  const [checkedTestIds, setCheckedTestIds] = useState<string[]>([]);

  const { data } = useTests({ team_id: teamId });

  const { data: triggersData } = useTriggers({ team_id: teamId });

  const { data: testTriggersData } = useTestTriggers({
    test_ids: (data?.tests || []).map((t) => t.id),
  });

  const tests = filterTests({
    search,
    tests: data?.tests,
    testTriggers: testTriggersData?.testTriggers,
    trigger_id,
  });

  // clear checked tests when selected trigger changes
  useEffect(() => {
    setCheckedTestIds([]);
  }, [trigger_id]);

  // clear checked tests when list changes
  useEffect(() => {
    const sortedTestsIds = (data?.tests || []).map((t) => t.id);
    sortedTestsIds.sort();

    // use ids because don't want to clear selection if groups change
    if (!isEqual(testIdsRef.current, sortedTestsIds)) {
      testIdsRef.current = sortedTestsIds;
      setCheckedTestIds([]);
    }
  }, [data?.tests]);

  const testTriggers = testTriggersData?.testTriggers || [];
  const triggers = triggersData?.triggers || [];

  const checkedTests = (tests || []).filter((t) =>
    checkedTestIds.includes(t.id)
  );

  return (
    <Box pad="medium" width="full">
      <Header
        checkedTests={checkedTests}
        search={search}
        setSearch={setSearch}
        tests={tests}
        testTriggers={testTriggers}
        triggers={triggers}
      />
      <List
        checkedTestIds={checkedTestIds}
        setCheckedTestIds={setCheckedTestIds}
        tests={tests}
        testTriggers={testTriggers}
        triggers={triggers}
      />
    </Box>
  );
}
