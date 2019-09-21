"use strict";
const importJsx = require("import-jsx");
const React = require("react");
const { Box, render, Static } = require("ink");

const Run = importJsx("./run.jsx");

const names = [
  "Sign in and out",
  "Enter giveaway",
  "Post comment",
  "Create project",
  "Sign in: wrong password"
];

const statuses = ["ok", "broken", "ok", "ok", "runs"];

const Runs = () => {
  const runs = names.map((name, i) => {
    return <Run key={i} name={name} status={statuses[i]} />;
  });

  return (
    <Box flexDirection="column">
      <Static>{runs}</Static>
    </Box>
  );
};

render(<Runs />);
