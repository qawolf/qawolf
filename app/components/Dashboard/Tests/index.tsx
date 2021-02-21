import { Box } from "grommet";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";

import { useTests, useTriggers } from "../../../hooks/queries";
import { StateContext } from "../../StateContext";
import Header from "./Header";
import List from "./List";
import { filterTests } from "./List/helpers";

export default function Tests(): JSX.Element {
  const { query } = useRouter();
  const trigger_id = query.trigger_id as string;

  const { teamId } = useContext(StateContext);
  const [search, setSearch] = useState("");

  const { data, startPolling, stopPolling } = useTests({ team_id: teamId });
  const tests = filterTests({ search, tests: data?.tests, trigger_id });

  const { data: triggersData } = useTriggers({ team_id: teamId });

  useEffect(() => {
    startPolling(10 * 1000);

    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling, teamId]);

  return (
    <Box pad="medium" width="full">
      <Header search={search} setSearch={setSearch} />
      <List tests={tests} triggers={triggersData?.triggers || []} />
    </Box>
  );
}
