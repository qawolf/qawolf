import { Box } from "grommet";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { useSuite } from "../../../hooks/queries";
import { state } from "../../../lib/state";
import { RunStatus } from "../../../lib/types";
import Spinner from "../../shared/Spinner";
import { filterRuns } from "../helpers";
import Header from "./Header";
import List from "./List";

type Props = {
  suiteId: string;
  teamId: string;
};

export default function Suite({ suiteId, teamId }: Props): JSX.Element {
  const { query } = useRouter();
  const status = (query.status || null) as RunStatus | null;

  const [checkedTestIds, setCheckedTestIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");

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

  // clear checked test ids if suite changes
  useEffect(() => {
    if (suiteId) setCheckedTestIds([]);
  }, [suiteId]);

  // set branch to suite's branch
  useEffect(() => {
    if (suite?.branch) state.setBranch(suite.branch);
  }, [suite?.branch]);

  const filteredRuns = filterRuns({ runs: suite?.runs || [], search, status });

  const innerHtml = suite ? (
    <>
      <Header search={search} setSearch={setSearch} suite={suite} />
      <List
        checkedTestIds={checkedTestIds}
        runs={filteredRuns}
        setCheckedTestIds={setCheckedTestIds}
        suite={suite}
      />
    </>
  ) : (
    <Spinner />
  );

  return <Box width="full">{innerHtml}</Box>;
}
