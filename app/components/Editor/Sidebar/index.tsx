import { Box } from "grommet";
import { IKeyboardEvent } from "monaco-editor";
import { useRouter } from "next/router";
import { Resizable, ResizeCallback } from "re-resizable";
import { useContext, useState } from "react";

import { state } from "../../../lib/state";
import { NavigationOption } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { StateContext } from "../../StateContext";
import { RunnerContext } from "../contexts/RunnerContext";
import { TestContext } from "../contexts/TestContext";
import { buildTestHref } from "../helpers";
import Buttons from "./Buttons";
import CodeEditor from "./CodeEditor";
import HelpersEditor from "./HelpersEditor";
import Navigation from "./Navigation";
import RunLogs from "./RunLogs";
import Snippet from "./Snippet";

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

export default function Sidebar(): JSX.Element {
  const { query, push } = useRouter();
  const { editorSidebarWidth } = useContext(StateContext);

  const { controller, run, suite, team, test } = useContext(TestContext);
  const { progress, runTest, selection, stopTest } = useContext(RunnerContext);

  const [selected, setSelected] = useState<NavigationOption>("code");

  const isTestDeleted = !!test?.deleted_at;
  // TODO: replace
  const isSnippetVisible = true;
  const isActionDisabled = isTestDeleted || isSnippetVisible;

  const handleResizeStop: ResizeCallback = (_, __, ___, delta): void => {
    state.setEditorSidebarWidth(editorSidebarWidth + delta.width);
  };

  const isRunning = query.test_id && progress && !progress?.completed_at;

  const handleAction = (): void => {
    if (isActionDisabled) return;

    if (run) {
      // edit the test
      push(buildTestHref({ run, suite }));
      return;
    }

    if (test) {
      if (isRunning) {
        stopTest();
      } else {
        // run the test
        const { code, id: test_id, version } = controller;
        runTest({ code, helpers: team.helpers, selection, test_id, version });
      }
    }
  };

  const handleEditorKeyDown = (e: IKeyboardEvent): void => {
    if ((e.ctrlKey || e.metaKey) && e.code === "Enter") {
      e.stopPropagation();
      handleAction();
    } else if ((e.ctrlKey || e.metaKey) && e.code === "KeyS") {
      e.preventDefault();
      state.setToast({ expiresIn: 3000, message: copy.toastAutosave });
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
        <Snippet isVisible={isSnippetVisible} />
        {!isSnippetVisible && (
          <Buttons
            isActionDisabled={isActionDisabled}
            isRun={!!query.run_id}
            isRunLoading={!run}
            isRunning={isRunning}
            onAction={handleAction}
            selection={selection}
          />
        )}
      </Box>
    </Resizable>
  );
}
