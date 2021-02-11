import { Box } from "grommet";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";

import { useDashboard } from "../../../hooks/queries";
import { Trigger } from "../../../lib/types";
import { StateContext } from "../../StateContext";
import Header from "./Header";
import History from "./History";
import List from "./List";

type Props = {
  selectedTrigger: Trigger;
  triggers: Trigger[];
  wolfVariant: string;
};

const POLL_INTERVAL = 10 * 1000;

export default function Tests({
  selectedTrigger,
  triggers,
  wolfVariant,
}: Props): JSX.Element {
  const { query } = useRouter();
  const suiteId = (query.suite_id as string) || null;

  const { triggerId } = useContext(StateContext);

  const [hoverSuiteId, setHoverSuiteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data, loading, startPolling, stopPolling } = useDashboard({
    trigger_id: triggerId,
  });

  const finalSuiteId = hoverSuiteId || suiteId;

  const suites = data?.dashboard.suites || null;
  const tests = (!finalSuiteId && data?.dashboard.tests) || null;

  // poll for suites
  useEffect(() => {
    if (!triggerId) {
      stopPolling();
      return;
    }

    startPolling(POLL_INTERVAL);

    return () => stopPolling();
  }, [startPolling, stopPolling, triggerId]);

  const selectedSuite = finalSuiteId
    ? suites?.find((suite) => suite.id === finalSuiteId)
    : null;

  // it is not possible to have a suite without runs
  // so suite is loading if runs are not defined
  const isLoading = finalSuiteId ? !selectedSuite?.runs : loading;

  return (
    <>
      <Header selectedIds={selectedIds} trigger={selectedTrigger} />
      <Box
        align="start"
        direction="row"
        fill
        justify="between"
        margin={{ top: "large" }}
      >
        <List
          isLoading={isLoading}
          runs={selectedSuite?.runs || null}
          selectedIds={selectedIds}
          selectedTriggerId={triggerId}
          setSelectedIds={setSelectedIds}
          testTriggers={testTriggers}
          tests={tests}
          triggers={triggers}
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
