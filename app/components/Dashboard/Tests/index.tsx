import { Box } from "grommet";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";

import { useDashboard } from "../../../hooks/queries";
import { Group } from "../../../lib/types";
import { StateContext } from "../../StateContext";
import Header from "./Header";
import History from "./History";
import List from "./List";
import { getGroupTests } from "./utils";

type Props = {
  groups: Group[];
  selectedGroup: Group;
  wolfVariant: string;
};

const POLL_INTERVAL = 10 * 1000;

export default function Tests({
  groups,
  selectedGroup,
  wolfVariant,
}: Props): JSX.Element {
  const { query } = useRouter();
  const suiteId = (query.suite_id as string) || null;

  const { groupId } = useContext(StateContext);

  const [hoverSuiteId, setHoverSuiteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data, loading, startPolling, stopPolling } = useDashboard({
    group_id: groupId,
  });

  const finalSuiteId = hoverSuiteId || suiteId;

  const suites = data?.dashboard.suites || null;
  const tests = (!finalSuiteId && data?.dashboard.tests) || null;

  // poll for suites
  useEffect(() => {
    if (!groupId) {
      stopPolling();
      return;
    }

    startPolling(POLL_INTERVAL);

    return () => stopPolling();
  }, [groupId, startPolling, stopPolling]);

  const selectedSuite = finalSuiteId
    ? suites?.find((suite) => suite.id === finalSuiteId)
    : null;

  // it is not possible to have a suite without runs
  // so suite is loading if runs are not defined
  const isLoading = finalSuiteId ? !selectedSuite?.runs : loading;
  const groupTests = getGroupTests(data?.dashboard.tests);

  return (
    <>
      <Header group={selectedGroup} selectedIds={selectedIds} />
      <Box
        align="start"
        direction="row"
        fill
        justify="between"
        margin={{ top: "large" }}
      >
        <List
          groups={groups}
          groupTests={groupTests}
          isLoading={isLoading}
          runs={selectedSuite?.runs || null}
          selectedGroupId={groupId}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          tests={tests}
          wolfVariant={wolfVariant}
        />
        <History
          selectedSuiteId={suiteId}
          setHoverSuiteId={setHoverSuiteId}
          suites={suites}
        />
      </Box>
    </>
  );
}
