import { Box } from "grommet";
import { useState } from "react";

import { NavigationOption } from "../../../lib/types";
import CodeEditor from "./CodeEditor";
import HelpersEditor from "./HelpersEditor";
import Navigation from "./Navigation";
import RunLogs from "./RunLogs";

const WIDTH = "40%";

export default function Sidebar(): JSX.Element {
  const [selected, setSelected] = useState<NavigationOption>("code");
  const width = selected ? WIDTH : undefined;

  return (
    <Box background="black" flex={false} height="full" width={width}>
      <Navigation selected={selected} setSelected={setSelected} />
      {selected === "code" && <CodeEditor />}
      {selected === "helpers" && <HelpersEditor />}
      <RunLogs isVisible={selected === "logs"} />
    </Box>
  );
}
