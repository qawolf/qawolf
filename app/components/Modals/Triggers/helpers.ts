import { Trigger } from "../../../lib/types";
import { copy } from "../../../theme/copy";

export const getDefaultScheduleName = (
  repeatMinutes: number,
  triggers: Trigger[]
) => {
  const defaultName = repeatMinutes === 60 ? copy.hourly : copy.daily;

  if (triggers.some((t) => t.name === defaultName)) {
    return copy.triggerNamePlaceholder;
  }

  return defaultName;
};

export const labelTextProps = {
  color: "gray9",
  margin: { bottom: "small" },
  size: "componentBold" as const,
};
