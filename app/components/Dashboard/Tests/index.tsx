import { Box } from "grommet";
import { useContext, useEffect, useState } from "react";

import { useTests } from "../../../hooks/queries";
import { StateContext } from "../../StateContext";
import Header from "./Header";
import List from "./List";

export default function Tests(): JSX.Element {
  const { teamId } = useContext(StateContext);
  const [search, setSearch] = useState("");

  const { data, startPolling, stopPolling } = useTests({ team_id: teamId });
  const tests =
    data?.tests?.filter((t) => {
      return t.name.toLowerCase().includes(search.toLowerCase());
    }) || null;

  useEffect(() => {
    startPolling(10 * 1000);

    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling, teamId]);

  return (
    <Box pad="medium" width="full">
      <Header search={search} setSearch={setSearch} />
      <List tests={tests} />
    </Box>
  );
}
