import { Icon } from "grommet-icons";

import { Trigger } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import Calendar from "../../shared-new/icons/Calendar";

export const getDefaultScheduleName = (
  repeatMinutes: number,
  triggers: Trigger[]
): string => {
  const defaultName = repeatMinutes === 60 ? copy.hourly : copy.daily;

  if (triggers.some((t) => t.name === defaultName)) {
    return copy.triggerNamePlaceholder;
  }

  return defaultName;
};

export const getTriggerIconComponent = (trigger: Trigger): Icon => {
  return Calendar;
};

export const labelTextProps = {
  color: "gray9",
  margin: { bottom: "small" },
  size: "componentBold" as const,
};
