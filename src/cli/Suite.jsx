"use strict";
const importJsx = require("import-jsx");
const { Box, Color, render, Static } = require("ink");
const React = require("react");

const ProgressBar = importJsx("./ProgressBar.jsx");
const Workflow = importJsx("./Workflow.jsx");

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

  const completeWorkflowsHtml = completeWorkflows.map(workflow => {
    return <Workflow key={workflow.name} workflow={workflow} />;
  });

  const runsWorkflowsHtml = runsWorkflows.map(workflow => {
    return <Workflow key={workflow.name} showSteps workflow={workflow} />;
  });

  return (
    <Box flexDirection="column">
      <Static>{completeWorkflowsHtml}</Static>
      <Box flexDirection="column">{runsWorkflowsHtml}</Box>
      {!summary && (
        <ProgressBar
          completeCount={completeWorkflows.length}
          totalCount={workflows.length}
        />
      )}
    </Box>
  );
};

module.exports = props => {
  render(<Suite {...props} />);
};
