import { useEffect, useState } from "react";

import { RunnerClient } from "../../../lib/runner";
import { ElementChooserValue } from "../../../lib/types";

export type ElementChooserHook = {
  elementChooserValue: ElementChooserValue;
  startElementChooser: () => void;
  stopElementChooser: () => void;
};

export const useElementChooser = (
  runner: RunnerClient | null
): ElementChooserHook => {
  const [value, setValue] = useState<ElementChooserValue>({ active: false });

  useEffect(() => {
    if (!runner) return;

    // clear on disconnect
    const onDisconnect = (): void => setValue({ active: false });
    runner.on("disconnect", onDisconnect);

    const onEvent = (value: ElementChooserValue): void => setValue(value);
    runner.on("elementchooser", onEvent);

    return () => {
      runner.off("disconnect", onDisconnect);
      runner.off("elementchooser", onEvent);
    };
  }, [runner]);

  return {
    elementChooserValue: value,
    startElementChooser: () => runner?.startElementChooser(),
    stopElementChooser: () => runner?.stopElementChooser(),
  };
};
