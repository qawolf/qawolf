import { Box } from "grommet";
import { useContext, useEffect, useState } from "react";

import { edgeSize } from "../../../../theme/theme-new";
import { RunnerContext } from "../../contexts/RunnerContext";
import { TestContext } from "../../contexts/TestContext";
import CreateToggle from "./CreateToggle";

const PATCH_HANDLE = "// 🐺 create code here";

export default function CodeOptions(): JSX.Element {
  const { mouseLineNumber, progress } = useContext(RunnerContext);

  const { code, controller, hasWriteAccess } = useContext(TestContext);

  // track isCreateOn in state so toggle will update instantly
  const [isCreateOn, setIsCreateOn] = useState(!!code?.includes(PATCH_HANDLE));

  useEffect(() => {
    setIsCreateOn(!!code?.includes(PATCH_HANDLE));
  }, [code]);

  const handleClick = () => {
    if (!code || !controller) return;

    if (isCreateOn) {
      // replace up to one leading newline
      const regex = new RegExp(`\n?${PATCH_HANDLE}`, "g");
      controller.updateCode(code.replace(regex, ""));
      setIsCreateOn(false);
    } else {
      const lines = code.split("\n");
      const insertIndex = mouseLineNumber ? mouseLineNumber - 1 : lines.length;

      // if the selected line is empty, insert it there
      if (lines[insertIndex] === "") lines[insertIndex] = PATCH_HANDLE;
      // otherwise insert it after the line
      else lines.splice(insertIndex + 1, 0, PATCH_HANDLE);

      controller.updateCode(lines.join("\n"));
      setIsCreateOn(true);
    }
  };

  return (
    <Box
      style={{
        right: edgeSize.small,
        position: "absolute",
        top: `calc(${edgeSize.small} + ${edgeSize.xxsmall})`,
      }}
    >
      <Box style={{ position: "relative" }}>
        <CreateToggle
          isCreateOn={isCreateOn}
          isEnabled={progress?.status !== "created"}
          isVisible={hasWriteAccess}
          onClick={handleClick}
        />
      </Box>
    </Box>
  );
}
