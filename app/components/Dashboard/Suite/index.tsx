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

  const { data } = useSuite(
    { id: suiteId },
    { includeRuns: true, pollInterval: 3 * 1000, teamId }
  );
  const suite = data?.suite;

  // clear checked test ids if suite changes
  useEffect(() => {
    if (suiteId) setCheckedTestIds([]);
  }, [suiteId]);

  const innerHtml = suite ? (
    <>
      <Header
        checkedTestIds={checkedTestIds}
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
    <Box pad="medium" width="full">
      {innerHtml}
    </Box>
  );
}
