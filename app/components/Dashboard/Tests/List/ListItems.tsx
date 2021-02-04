import { Box } from "grommet";
import { ReactNode } from "react";

import { routes } from "../../../../lib/routes";
import { SuiteRun, TestWithSummary } from "../../../../lib/types";
import ListEmpty from "./ListEmpty";
import StatusBars from "./StatusBars";
import TestCard from "./TestCard";
import TestRun from "./TestRun";

type Props = {
  isLoading: boolean;
  onCheck: (testId: string) => void;
  runs: SuiteRun[] | null;
  search: string;
  selectedIds: string[];
  tests: TestWithSummary[] | null;
  wolfVariant: string;
};

export default function ListItems({
  isLoading,
  onCheck,
  runs,
  search,
  selectedIds,
  tests,
  wolfVariant,
}: Props): JSX.Element {
  const hasTests = !isLoading && tests;

  let cardsHtml: ReactNode | ReactNode[] = (
    <ListEmpty hasSearch={!!search} isLoading={isLoading} />
  );

  const filteredTests = hasTests
    ? tests.filter((test) => {
        return (
          !search || test.name.toLowerCase().includes(search.toLowerCase())
        );
      })
    : null;
  const filteredRuns = runs
    ? runs.filter((run) => {
        return (
          !search || run.test_name.toLowerCase().includes(search.toLowerCase())
        );
      })
    : null;

  if (filteredTests?.length) {
    cardsHtml = filteredTests.map((test) => {
      const isChecked = selectedIds.includes(test.id);
      const inProgress = test.summary.last_runs.length
        ? test.summary.last_runs[0].status === "created"
        : false;

      return (
        <TestCard
          gifUrl={test.summary.gif_url}
          isChecked={isChecked}
          inProgress={inProgress}
          key={test.id}
          name={test.name}
          onCheck={() => onCheck(test.id)}
          route={`${routes.test}/${test.id}`}
          wolfVariant={wolfVariant}
        >
          <StatusBars runs={test.summary.last_runs} />
        </TestCard>
      );
    });
  } else if (filteredRuns?.length) {
    cardsHtml = filteredRuns.map((run) => {
      const isChecked = selectedIds.includes(run.test_id);

      return (
        <TestCard
          gifUrl={run.gif_url}
          isChecked={isChecked}
          isDeleted={run.is_test_deleted}
          inProgress={!run.completed_at}
          key={run.id}
          name={run.test_name}
          onCheck={() => onCheck(run.test_id)}
          route={`${routes.run}/${run.id}`}
          wolfVariant={wolfVariant}
        >
          <TestRun run={run} />
        </TestCard>
      );
    });
  }

  return (
    <Box margin={{ top: "large" }} overflow="auto" pad={{ right: "large" }}>
      {cardsHtml}
    </Box>
  );
}
