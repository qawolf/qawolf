import { useEffect, useRef, useState } from "react";

import { Run, Test } from "../../../lib/types";

type IsLatestCode = {
  run: Run | null;
  test: Test | null;
};

export const useIsLatestCode = ({ run, test }: IsLatestCode): boolean => {
  const [isLatestCode, setIsLatestCode] = useState(true);

  const idRef = useRef<string>();

  useEffect(() => {
    if (!run && !test) return;

    // When the run first loads (the id changes) check the run.code matches the test.code.
    // If it does not match, we show a "View Latest" button that links to the test and the code is read-only.
    // If it matches, we allow the user to edit it which is why we only evaluate this on the first load.
    // Otherwise as soon as they edit the code it would no longer be the same.
    const id = run?.id || test?.id;
    if (idRef.current === id) return;
    idRef.current = id;

    setIsLatestCode(!run || run.code === test?.code);
  }, [run, test]);

  return isLatestCode;
};
