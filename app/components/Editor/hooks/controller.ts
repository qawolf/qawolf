import { useEffect, useState } from "react";

import { Run, Test } from "../../../lib/types";
import { TestController } from "../contexts/TestController";

type ControllerHook = {
  code: string;
  controller: TestController;
};

type UseController = {
  run: Run | null;
  test: Test | null;
};

export const useController = ({ run, test }: UseController): ControllerHook => {
  const [code, setCode] = useState("");
  const [controller, setController] = useState(null);

  useEffect(() => {
    const controller = new TestController();

    controller.on("codeupdated", setCode);
    setController(controller);

    return () => {
      controller.off("codeupdated", setCode);
      controller.close();
    };
  }, []);

  useEffect(() => {
    if (!controller) return;

    controller.setTest(test, run);
  }, [controller, test, run]);

  return { code, controller };
};
