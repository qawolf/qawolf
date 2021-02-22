import { Box } from "grommet";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";

import { useTests, useTestTriggers, useTriggers } from "../../../hooks/queries";
import { StateContext } from "../../StateContext";
import Header from "./Header";
import List from "./List";
import { filterTests } from "../helpers";

export default function Tests(): JSX.Element {
  const { query } = useRouter();
  const trigger_id = query.trigger_id as string;

  const { teamId } = useContext(StateContext);
  const [search, setSearch] = useState("");

  const { data, startPolling, stopPolling } = useTests({ team_id: teamId });

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

  useEffect(() => {
    startPolling(10 * 1000);

    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling, teamId]);

  return (
    <Box pad="medium" width="full">
      <Header search={search} setSearch={setSearch} />
      <List
        tests={tests}
        testTriggers={testTriggersData?.testTriggers || []}
        triggers={triggersData?.triggers || []}
      />
    </Box>
  );
}
