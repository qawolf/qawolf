import { Box, ThemeContext } from "grommet";
import { useState } from "react";

import { NavigationOption } from "../../../lib/types";
import { theme } from "../../../theme/theme-new";
import CodeEditor from "./CodeEditor";
import HelpersEditor from "./HelpersEditor";
import Navigation from "./Navigation";
import RunLogs from "./RunLogs";
import Buttons from "./Buttons";

const width = "480px";

export default function Sidebar(): JSX.Element {
  const [selected, setSelected] = useState<NavigationOption>("code");

  return (
    <ThemeContext.Extend value={theme}>
      <Box background="gray10" flex={false} height="full" width={width}>
        <Navigation selected={selected} setSelected={setSelected} />
        {selected === "code" && <CodeEditor />}
        {selected === "helpers" && <HelpersEditor />}
        <RunLogs isVisible={selected === "logs"} />
        <Buttons />
      </Box>
    </ThemeContext.Extend>
  );
}
