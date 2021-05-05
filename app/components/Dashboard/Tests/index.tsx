import { Box } from "grommet";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { useTestTriggers, useTriggers } from "../../../hooks/queries";
import { useTests } from "../../../hooks/tests";
import { filterTests } from "../helpers";
import Header from "./Header";
import List from "./List";

type Props = {
  branch: string | null;
  teamId: string;
};

export default function Tests({ branch, teamId }: Props): JSX.Element {
  const { query } = useRouter();
  const trigger_id = query.trigger_id as string;

  const [search, setSearch] = useState("");
  const [checkedTestIds, setCheckedTestIds] = useState<string[]>([]);

  const { tests: testsData, loading } = useTests({ branch, teamId });

  const { data: triggersData } = useTriggers({ team_id: teamId });

  const { data: testTriggersData } = useTestTriggers({
    test_ids: testsData.map((t) => t.id),
  });

  const tests = filterTests({
    search,
    tests: loading ? null : testsData,
    testTriggers: testTriggersData?.testTriggers,
    trigger_id,
  });

  // clear checked tests when selected trigger changes
  useEffect(() => {
    setCheckedTestIds([]);
  }, [trigger_id]);

  // clear checked tests when list changes
  // TODO: revisit
  useEffect(() => {
    setCheckedTestIds([]);
  }, [testsData]);

  const testTriggers = testTriggersData?.testTriggers || [];
  const triggers = triggersData?.triggers || [];

  const checkedTests = (tests || []).filter((t) =>
    checkedTestIds.includes(t.id)
  );
  const testIds = testsData.map((t) => t.id);

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
        testIds={testIds}
        tests={tests}
        testTriggers={testTriggers}
        triggers={triggers}
      />
    </Box>
  );
}
