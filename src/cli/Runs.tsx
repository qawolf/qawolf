import { Box, Color, render, Static } from "ink";
import { min } from "lodash";
import React from "react";
import { ProgressBar } from "./ProgressBar";
import { Results } from "./Results";
import { Run } from "./Run";
import { Run as RunType, Summary } from "../types";

type PropTypes = {
  runs: RunType[];
  summary: Summary | null;
};

const getStepsCounts = (
  runs: RunType[]
): { completeCount: number; totalCount: number } => {
  let completeCount = 0;
  let totalCount = 0;

  runs.forEach(run => {
    completeCount += run.steps.filter(
      step => step.status !== "runs" && step.status !== "queued"
    ).length;
    totalCount += run.steps.length;
  });

  return { completeCount, totalCount };
};

const renderRuns = ({
  runs,
  showSteps
}: {
  runs: RunType[];
  showSteps?: boolean;
}) => {
  return runs.map(run => (
    <Run key={run.name} showSteps={!!showSteps} run={run} />
  ));
};

const Runs = ({ summary, runs }: PropTypes) => {
  const completeRuns = runs.filter(run => {
    return run.status === "pass" || run.status === "fail";
  });
  const runsRuns = runs.filter(run => run.status === "runs");
  const failRuns = runs.filter(run => run.status === "fail");

  const completeRunsHtml = renderRuns({
    runs: completeRuns
  });
  const runsRunsHtml = renderRuns({
    runs: runsRuns,
    showSteps: true
  });
  const failRunsHtml = summary
    ? renderRuns({ runs: failRuns, showSteps: true })
    : null;

  const actionText = summary ? "ran" : "is running";
  const startTime = min(runs.map(run => run.startTime)) as number;

  return (
    <Box flexDirection="column">
      <Static>{completeRunsHtml}</Static>

      <Color bold cyan>
        {`\n🐺 QA Wolf ${actionText} your tests!\n`}
      </Color>
      <Box flexDirection="column">{runsRunsHtml}</Box>
      {!summary && <ProgressBar {...getStepsCounts(runs)} />}
      {!!summary && !!summary.fail && (
        <Color bold red>{`\n${summary.fail} failed`}</Color>
      )}
      {failRunsHtml}
      <Results startTime={startTime} summary={summary} />
    </Box>
  );
};

export default (props: PropTypes) => {
  render(<Runs {...props} />);
};
