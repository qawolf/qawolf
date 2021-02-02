import { Box, ThemeContext } from "grommet";
import { useContext, useState } from "react";
import { Resizable, ResizeCallback } from "re-resizable";

import { NavigationOption } from "../../../lib/types";
import { theme } from "../../../theme/theme-new";
import CodeEditor from "./CodeEditor";
import HelpersEditor from "./HelpersEditor";
import Navigation from "./Navigation";
import RunLogs from "./RunLogs";
import Buttons from "./Buttons";
import { state } from "../../../lib/state";
import { StateContext } from "../../StateContext";

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
  const { editorSidebarWidth } = useContext(StateContext);

  const [selected, setSelected] = useState<NavigationOption>("code");

  const handleResizeStop: ResizeCallback = (_, __, ___, delta): void => {
    state.setEditorSidebarWidth(editorSidebarWidth + delta.width);
  };

  return (
    <ThemeContext.Extend value={theme}>
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
          {selected === "code" && <CodeEditor />}
          {selected === "helpers" && <HelpersEditor />}
          <RunLogs isVisible={selected === "logs"} />
          <Buttons />
        </Box>
      </Resizable>
    </ThemeContext.Extend>
  );
}
