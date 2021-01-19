import { useContext } from "react";

import { copy } from "../../../theme/copy";
import PlayButton from "../../shared/PlayButton";
import { RunnerContext } from "../contexts/RunnerContext";
import { TestContext } from "../contexts/TestContext";

export default function RunButton(): JSX.Element {
  const { controller, team, test } = useContext(TestContext);
  const { runTest, selection } = useContext(RunnerContext);

  const runCurrentTest = () => {
    const { code, id: test_id, version } = controller;
    runTest({ code, helpers: team.helpers, selection, test_id, version });
  };

  if (!test) return null;

  const message = selection
    ? copy.runLines(selection.endLine - selection.startLine + 1)
    : null;

  return <PlayButton message={message} onClick={runCurrentTest} />;
}
