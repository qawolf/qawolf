import { Box, ThemeContext } from "grommet";
import { useState } from "react";
import { Resizable } from "re-resizable";

import { NavigationOption } from "../../../lib/types";
import { theme } from "../../../theme/theme-new";
import CodeEditor from "./CodeEditor";
import HelpersEditor from "./HelpersEditor";
import Navigation from "./Navigation";
import RunLogs from "./RunLogs";
import Buttons from "./Buttons";

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

const minWidth = 480;

export default function Sidebar(): JSX.Element {
  const [selected, setSelected] = useState<NavigationOption>("code");

  return (
    <ThemeContext.Extend value={theme}>
      <Resizable
        defaultSize={{
          height: "100%",
          width: minWidth,
        }}
        enable={enable}
        maxWidth="50%"
        minWidth={minWidth}
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
