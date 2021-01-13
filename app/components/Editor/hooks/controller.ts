import { useEffect, useState } from "react";

import { Run, Test } from "../../../lib/types";
import { TestController } from "../contexts/TestController";

type ControllerHook = {
  code: string;
  controller: TestController;
};

type UseController = {
  isLatestCode: boolean;
  run: Run | null;
  test: Test | null;
};

export const useController = ({
  isLatestCode,
  run,
  test,
}: UseController): ControllerHook => {
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

    const readonlyRun = isLatestCode ? null : run;
    controller.setTest(test, readonlyRun);
  }, [controller, test, isLatestCode, run]);

  return { code, controller };
};
