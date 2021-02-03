import { Box } from "grommet";
import { Resizable, ResizeCallback } from "re-resizable";
import { useCallback, useContext, useState } from "react";

import { state } from "../../../lib/state";
import { NavigationOption } from "../../../lib/types";
import { StateContext } from "../../StateContext";
import Buttons from "./Buttons";
import CodeEditor from "./CodeEditor";
import HelpersEditor from "./HelpersEditor";
import Navigation from "./Navigation";
import RunLogs from "./RunLogs";
import { Mode } from "../hooks/mode";
import { TestContext } from "../contexts/TestContext";
import { RunnerContext } from "../contexts/RunnerContext";
import { IKeyboardEvent } from "monaco-editor";

type Props = { mode: Mode };

const enable = {
  top: false,
  right: true,
  bottom: false,
  left: false,
  topRight: false,
  bottomRight: false,
  bottomLeft: false,
  topLeft: false,
};

export default function Sidebar({ mode }: Props): JSX.Element {
  const { editorSidebarWidth } = useContext(StateContext);

  const { controller, team, test } = useContext(TestContext);
  const { runTest, selection } = useContext(RunnerContext);

  const [selected, setSelected] = useState<NavigationOption>("code");

  const handleResizeStop: ResizeCallback = (_, __, ___, delta): void => {
    state.setEditorSidebarWidth(editorSidebarWidth + delta.width);
  };

  const handleRunClick = (): void => {
    if (!test) return;

    const { code, id: test_id, version } = controller;

    runTest({ code, helpers: team.helpers, selection, test_id, version });
  };

  const handleEditorKeyDown = (e: IKeyboardEvent): void => {
    if ((e.ctrlKey || e.metaKey) && e.code === "Enter") {
      e.stopPropagation();
      handleRunClick();
    }
  };

  return (
    <Resizable
      defaultSize={{
        height: "100%",
        width: editorSidebarWidth,
      }}
      enable={enable}
      maxWidth="50%"
      minWidth={480}
      onResizeStop={handleResizeStop}
    >
      <Box background="gray10" flex={false} height="full">
        <Navigation selected={selected} setSelected={setSelected} />
        {selected === "code" && <CodeEditor onKeyDown={handleEditorKeyDown} />}
        {selected === "helpers" && (
          <HelpersEditor onKeyDown={handleEditorKeyDown} />
        )}
        <RunLogs isVisible={selected === "logs"} />
        {mode === "test" && (
          <Buttons onRunClick={handleRunClick} selection={selection} />
        )}
      </Box>
    </Resizable>
  );
}
