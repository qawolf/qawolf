"use strict";
const importJsx = require("import-jsx");
const { Box, render, Static } = require("ink");
const React = require("react");

const Workflow = importJsx("./workflow.jsx");

const Suite = ({ startTime, summary, workflows }) => {
  const completeWorkflows = workflows.filter(workflow => {
    return workflow.status === "pass" || workflow.status === "fail";
  });
  const runningWorkflows = workflows.filter(
    workflow => workflow.status === "runs"
  );

  const completeWorkflowsHtml = completeWorkflows.map(workflow => {
    return <Workflow key={workflow.name} workflow={workflow} />;
  });

  const runningWorkflowsHtml = runningWorkflows.map(workflow => {
    return <Workflow key={workflow.name} showSteps workflow={workflow} />;
  });

  return (
    <Box flexDirection="column">
      <Static>{completeWorkflowsHtml}</Static>
      <Box flexDirection="column">{runningWorkflowsHtml}</Box>
    </Box>
  );
};

module.exports = props => {
  render(<Suite {...props} />);
};
