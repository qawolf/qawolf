import { Box } from "grommet";
import { IKeyboardEvent } from "monaco-editor";
import { useRouter } from "next/router";
import { Resizable, ResizeCallback } from "re-resizable";
import { useContext, useState } from "react";
import { routes } from "../../../lib/routes";

import { state } from "../../../lib/state";
import { NavigationOption } from "../../../lib/types";
import { StateContext } from "../../StateContext";
import { RunnerContext } from "../contexts/RunnerContext";
import { TestContext } from "../contexts/TestContext";
import { Mode } from "../hooks/mode";
import Buttons from "./Buttons";
import CodeEditor from "./CodeEditor";
import HelpersEditor from "./HelpersEditor";
import Navigation from "./Navigation";
import RunLogs from "./RunLogs";

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
  const { push } = useRouter();
  const { editorSidebarWidth } = useContext(StateContext);

  const { controller, run, team, test } = useContext(TestContext);
  const { runTest, selection } = useContext(RunnerContext);

  const [selected, setSelected] = useState<NavigationOption>("code");

  const handleResizeStop: ResizeCallback = (_, __, ___, delta): void => {
    state.setEditorSidebarWidth(editorSidebarWidth + delta.width);
  };

  const handleAction = (): void => {
    if (run) {
      // edit the test
      push(`${routes.test}/${run.test_id}`);
      return;
    }

    if (test) {
      // run the test
      const { code, id: test_id, version } = controller;
      runTest({ code, helpers: team.helpers, selection, test_id, version });
    }
  };

  const handleEditorKeyDown = (e: IKeyboardEvent): void => {
    if ((e.ctrlKey || e.metaKey) && e.code === "Enter") {
      e.stopPropagation();
      handleAction();
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
        <Buttons
          action={run ? "edit" : "run"}
          onClick={handleAction}
          selection={selection}
        />
      </Box>
    </Resizable>
  );
}
