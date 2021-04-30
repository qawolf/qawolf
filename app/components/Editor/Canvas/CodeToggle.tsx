import { useContext, useEffect, useState } from "react";
import { PATCH_HANDLE } from "../../../lib/code";

import { copy } from "../../../theme/copy";
import Toggle from "../../shared/Toggle";
import { TestContext } from "../contexts/TestContext";

type Props = {
  isDisabled: boolean;
  mouseLineNumber: number | null;
};

export default function CodeToggle({
  isDisabled,
  mouseLineNumber,
}: Props): JSX.Element {
  const { code, controller } = useContext(TestContext);

  // track isOn in state so toggle will update instantly
  const [isOn, setIsOn] = useState(!!code?.includes(PATCH_HANDLE));

  useEffect(() => {
    setIsOn(!!code?.includes(PATCH_HANDLE));
  }, [code]);

  const handleClick = (): void => {
    if (!code || !controller) return;

    if (isOn) {
      // replace up to one leading newline
      const regex = new RegExp(`\n?${PATCH_HANDLE}`, "g");
      controller.updateCode(code.replace(regex, ""));
      setIsOn(false);
    } else {
      const lines = code.split("\n");
      const insertIndex = mouseLineNumber ? mouseLineNumber - 1 : lines.length;

      // if the selected line is empty, insert it there
      if (lines[insertIndex] === "") lines[insertIndex] = PATCH_HANDLE;
      // otherwise insert it after the line
      else lines.splice(insertIndex + 1, 0, PATCH_HANDLE);

      controller.updateCode(lines.join("\n"));
      setIsOn(true);
    }
  };

  return (
    <Toggle
      isDisabled={isDisabled}
      isOn={isOn}
      label={copy.createCode}
      onClick={handleClick}
    />
  );
}
