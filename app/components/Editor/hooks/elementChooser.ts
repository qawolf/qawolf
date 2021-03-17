import { useEffect, useState } from "react";

import { RunnerClient } from "../../../lib/runner";
import { ElementChooserValue } from "../../../lib/types";

export type ElementChooserHook = {
  startElementChooser: () => void;
  stopElementChooser: () => void;
  value: ElementChooserValue | null;
};

export const useElementChooser = (
  runner: RunnerClient | null
): ElementChooserHook => {
  const [value, setValue] = useState<ElementChooserValue | null>({
    active: false,
  });

  useEffect(() => {
    if (!runner) return;

    const onEvent = (value: ElementChooserValue): void => setValue(value);
    runner.on("elementchooser", onEvent);

    return () => {
      runner.off("elementchooser", onEvent);
    };
  }, [runner]);

  return {
    startElementChooser: () => runner?.startElementChooser(),
    stopElementChooser: () => runner?.stopElementChooser(),
    value,
  };
};
