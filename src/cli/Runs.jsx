"use strict";
const importJsx = require("import-jsx");
const { Box, Color, render, Static } = require("ink");
const React = require("react");

const ProgressBar = importJsx("./ProgressBar.jsx");
const Run = importJsx("./Run.jsx");
const Summary = importJsx("./Summary.jsx");

const getStepsCounts = runs => {
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

const renderRuns = ({ runs, showSteps }) => {
  return runs.map(run => (
    <Run key={run.name} showSteps={!!showSteps} run={run} />
  ));
};

const Suite = ({ startTime, summary, runs }) => {
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

  return (
    <Box flexDirection="column">
      <Static>{completeRunsHtml}</Static>
      <Box flexDirection="column">{runsRunsHtml}</Box>
      {!summary && <ProgressBar {...getStepsCounts(runs)} />}
      {!!summary && !!summary.fail && (
        <Color bold red>{`\n${summary.fail} failed`}</Color>
      )}
      {failRunsHtml}
      <Summary startTime={startTime} summary={summary} />
    </Box>
  );
};

module.exports = props => {
  render(<Suite {...props} />);
};
