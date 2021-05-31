import { Suite, Trigger } from "../../types";

type BuildSuiteName = {
  suite: Suite;
  trigger: Trigger | null;
};

export const buildSuiteName = ({ suite, trigger }: BuildSuiteName): string => {
  return trigger?.name || suite.tag_names || "manually triggered";
};
