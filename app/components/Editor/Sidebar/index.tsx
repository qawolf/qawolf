import { Box } from "grommet";
import { IKeyboardEvent } from "monaco-editor";
import { useRouter } from "next/router";
import { Resizable, ResizeCallback } from "re-resizable";
import { useContext, useState } from "react";

import { state } from "../../../lib/state";
import { NavigationOption } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { StateContext } from "../../StateContext";
import { EditorContext } from "../contexts/EditorContext";
import { RunnerContext } from "../contexts/RunnerContext";
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
  const { push } = useRouter();
  const { editorSidebarWidth } = useContext(StateContext);
  const { isLoaded, isTestDeleted, run, runId, suite } = useContext(
    EditorContext
  );
  const {
    elementChooserValue,
    progress,
    runTest,
    selection,
    stopTest,
  } = useContext(RunnerContext);

  const [selected, setSelected] = useState<NavigationOption>("code");

  const isChooserActive = elementChooserValue.isActive;
  const isActionDisabled = !isLoaded || isChooserActive || isTestDeleted;

  const handleResizeStop: ResizeCallback = (_, __, ___, delta): void => {
    state.setEditorSidebarWidth(editorSidebarWidth + delta.width);
  };

  const canStop = !runId && progress && !progress?.completed_at;

  const handleAction = (): void => {
    if (isActionDisabled) return;

    if (runId) {
      // edit the test
      push(buildTestHref({ run, suite }));
      return;
    }

    if (canStop) {
      stopTest();
    } else {
      runTest(selection);
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
        <CodeEditor
          isVisible={selected === "code"}
          onKeyDown={handleEditorKeyDown}
        />
        <HelpersEditor
          isVisible={selected === "helpers"}
          onKeyDown={handleEditorKeyDown}
        />
        <RunLogs isVisible={selected === "logs"} />
        <Snippet isVisible={isChooserActive} />
        {!isChooserActive && (
          <Buttons
            canStop={canStop}
            isActionDisabled={isActionDisabled}
            isRun={!!runId}
            isRunLoading={!run}
            onAction={handleAction}
            selection={selection}
          />
        )}
      </Box>
    </Resizable>
  );
}
