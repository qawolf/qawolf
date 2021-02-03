import { Box } from "grommet";
import { useContext, useEffect, useState } from "react";
import { copy } from "../../../theme/copy";
import Text from "../../shared-new/Text";
import Toggle from "../../shared-new/Toggle";
import { RunnerContext } from "../contexts/RunnerContext";
import { TestContext } from "../contexts/TestContext";

const patchHandle = "// 🐺 create code here";

export default function CodeToggle(): JSX.Element {
  const { mouseLineNumber, progress } = useContext(RunnerContext);
  const { code, controller, hasWriteAccess } = useContext(TestContext);

  // track isOn in state so toggle will update instantly
  const [isOn, setIsOn] = useState(!!code?.includes(patchHandle));

  useEffect(() => {
    setIsOn(!!code?.includes(patchHandle));
  }, [code]);

  const handleClick = (): void => {
    if (!code || !controller) return;

    if (isOn) {
      // replace up to one leading newline
      const regex = new RegExp(`\n?${patchHandle}`, "g");
      controller.updateCode(code.replace(regex, ""));
      setIsOn(false);
    } else {
      const lines = code.split("\n");
      const insertIndex = mouseLineNumber ? mouseLineNumber - 1 : lines.length;

      // if the selected line is empty, insert it there
      if (lines[insertIndex] === "") lines[insertIndex] = patchHandle;
      // otherwise insert it after the line
      else lines.splice(insertIndex + 1, 0, patchHandle);

      controller.updateCode(lines.join("\n"));
      setIsOn(true);
    }
  };

  return (
    <Box align="center" direction="row">
      <Text color="gray9" margin={{ right: "xxsmall" }} size="component">
        {copy.generateCode}
      </Text>
      <Toggle
        a11yTitle={`toggle ${copy.generateCode}`}
        isOn={isOn}
        onClick={handleClick}
      />
    </Box>
  );
}
