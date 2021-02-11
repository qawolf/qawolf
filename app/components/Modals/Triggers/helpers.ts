import { Icon } from "grommet-icons";
import isNil from "lodash/isNil";

import { TestTriggers, Trigger } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import Calendar from "../../shared-new/icons/Calendar";

type GetIsSelected = {
  testIds: string[];
  testTriggers: TestTriggers[];
  triggerId: string;
};

export type TriggerMode = "deployment" | "onDemand" | "schedule";

export const defaultRepeatMinutes = 24 * 60; // daily

export const getDefaultMode = (trigger: Trigger | null): TriggerMode => {
  if (!trigger || !isNil(trigger.repeat_minutes)) return "schedule";
  if (trigger.deployment_integration_id) return "deployment";

  return "onDemand";
};

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

export const getIsSelected = ({
  testIds,
  testTriggers,
  triggerId,
}: GetIsSelected): boolean => {
  return testIds.every((testId) => {
    const testTriggersForTest = testTriggers.find((t) => t.test_id === testId);

    return (testTriggersForTest?.trigger_ids || []).includes(triggerId);
  });
};

export const getTriggerIconComponent = (trigger: Trigger): Icon => {
  return Calendar;
};

export const labelTextProps = {
  color: "gray9",
  margin: { bottom: "small" },
  size: "componentBold" as const,
};

export const repeatMinutesOptions = [
  { label: copy.frequencyDaily, value: defaultRepeatMinutes },
  { label: copy.frequencyHourly, value: 60 },
];
