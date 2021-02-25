import { Box } from "grommet";
import { useContext, useEffect, useState } from "react";

import { useSuite } from "../../../hooks/queries";
import { RunStatus } from "../../../lib/types";
import Spinner from "../../shared-new/Spinner";
import { StateContext } from "../../StateContext";
import Header from "./Header";
import List from "./List";

type Props = { suiteId: string };

export default function Suite({ suiteId }: Props): JSX.Element {
  const { teamId } = useContext(StateContext);

  const [checkedTestIds, setCheckedTestIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<RunStatus | null>(null);

  const { data, startPolling, stopPolling } = useSuite(
    { id: suiteId },
    { includeRuns: true, teamId }
  );
  const suite = data?.suite;

  // poll for updates if some runs in progress
  useEffect(() => {
    if (suite?.runs.some((r) => r.status === "created")) {
      startPolling(3 * 1000);
    }

    return () => stopPolling();
  }, [startPolling, stopPolling, suite]);

  const innerHtml = suite ? (
    <>
      <Header
        search={search}
        setSearch={setSearch}
        setStatus={setStatus}
        status={status}
        suite={suite}
      />
      <List
        checkedTestIds={checkedTestIds}
        runs={suite.runs}
        search={search}
        setCheckedTestIds={setCheckedTestIds}
        status={status}
      />
    </>
  ) : (
    <Spinner />
  );

  return (
    <Box
      pad={{ bottom: "medium", horizontal: "medium", top: "large" }}
      width="full"
    >
      {innerHtml}
    </Box>
  );
}
