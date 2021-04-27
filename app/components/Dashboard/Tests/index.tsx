import { Box } from "grommet";
import isEqual from "lodash/isEqual";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

import { useTestTriggers, useTriggers } from "../../../hooks/queries";
import { useTests } from "../../../hooks/tests";
import { Group } from "../../../lib/types";
import { filterTests } from "../helpers";
import Header from "./Header";
import List from "./List";

type Props = {
  branch: string | null;
  groups: Group[] | null;
  teamId: string;
};

export default function Tests({ branch, groups, teamId }: Props): JSX.Element {
  const { query } = useRouter();
  const group_id = (query.group_id as string) || null;
  const trigger_id = query.trigger_id as string;

  const testIdsRef = useRef<string[]>([]);

  const [search, setSearch] = useState("");
  const [checkedTestIds, setCheckedTestIds] = useState<string[]>([]);

  const { tests: testsData, loading } = useTests({ branch, teamId });

  const { data: triggersData } = useTriggers({ team_id: teamId });

  const { data: testTriggersData } = useTestTriggers({
    test_ids: testsData.map((t) => t.id),
  });

  const tests = filterTests({
    group_id,
    search,
    tests: loading ? null : testsData,
    testTriggers: testTriggersData?.testTriggers,
    trigger_id,
  });

  // clear checked tests when selected group or trigger changes
  useEffect(() => {
    setCheckedTestIds([]);
  }, [group_id, trigger_id]);

  // clear checked tests when list changes
  useEffect(() => {
    const sortedTestsIds = testsData.map((t) => t.id);
    sortedTestsIds.sort();

    // use ids because don't want to clear selection if groups change
    // unless we are changing assigned group from the group page
    if (query.group_id || !isEqual(testIdsRef.current, sortedTestsIds)) {
      testIdsRef.current = sortedTestsIds;
      setCheckedTestIds([]);
    }
  }, [query.group_id, testsData]);

  const testTriggers = testTriggersData?.testTriggers || [];
  const triggers = triggersData?.triggers || [];

  const checkedTests = (tests || []).filter((t) =>
    checkedTestIds.includes(t.id)
  );
  const groupName = groups?.find((g) => g.id === query.group_id)?.name || null;
  const testIds = testsData.map((t) => t.id);

  return (
    <Box pad="medium" width="full">
      <Header
        checkedTests={checkedTests}
        groupName={groupName}
        hasGroups={!!groups?.length}
        search={search}
        setSearch={setSearch}
        tests={tests}
        testTriggers={testTriggers}
        triggers={triggers}
      />
      <List
        checkedTestIds={checkedTestIds}
        groups={groups}
        setCheckedTestIds={setCheckedTestIds}
        testIds={testIds}
        tests={tests}
        testTriggers={testTriggers}
        triggers={triggers}
      />
    </Box>
  );
}
