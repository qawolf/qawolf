"use strict";
const importJsx = require("import-jsx");
const { Box, Color, render, Static } = require("ink");
const React = require("react");

const ProgressBar = importJsx("./ProgressBar.jsx");
const Summary = importJsx("./Summary.jsx");
const Workflow = importJsx("./Workflow.jsx");

const getStepsCounts = workflows => {
  let completeCount = 0;
  let totalCount = 0;

  workflows.forEach(workflow => {
    completeCount += workflow.steps.filter(
      step => step.status !== "runs" && step.status !== "queued"
    ).length;
    totalCount += workflow.steps.length;
  });

  return { completeCount, totalCount };
};

const renderWorkflows = ({ workflows, showSteps }) => {
  return workflows.map(workflow => (
    <Workflow key={workflow.name} showSteps={!!showSteps} workflow={workflow} />
  ));
};

const Suite = ({ startTime, summary, workflows }) => {
  const completeWorkflows = workflows.filter(workflow => {
    return workflow.status === "pass" || workflow.status === "fail";
  });
  const runsWorkflows = workflows.filter(
    workflow => workflow.status === "runs"
  );
  const failWorkflows = workflows.filter(
    workflow => workflow.status === "fail"
  );

  const completeWorkflowsHtml = renderWorkflows({
    workflows: completeWorkflows
  });
  const runsWorkflowsHtml = renderWorkflows({
    workflows: runsWorkflows,
    showSteps: true
  });
  const failWorkflowsHtml = summary
    ? renderWorkflows({ workflows: failWorkflows, showSteps: true })
    : null;

  return (
    <Box flexDirection="column">
      <Static>{completeWorkflowsHtml}</Static>
      <Box flexDirection="column">{runsWorkflowsHtml}</Box>
      {!summary && <ProgressBar {...getStepsCounts(workflows)} />}
      {!!summary && !!summary.fail && (
        <Color bold red>{`\n${summary.fail} failed`}</Color>
      )}
      {failWorkflowsHtml}
      <Summary startTime={startTime} summary={summary} />
    </Box>
  );
};

module.exports = props => {
  render(<Suite {...props} />);
};
