import { routes } from "../../lib/routes";
import { Run, Suite } from "../../lib/types";

type BuildTestHref = {
  run: Run | null;
  suite: Suite | null;
};

export const buildTestHref = ({ run, suite }: BuildTestHref): string => {
  const search = suite?.environment_variables ? `?suite_id=${suite.id}` : "";

  return `${routes.test}/${run?.test_id}${search}`;
};
