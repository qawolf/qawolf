import { Icon } from "grommet-icons";
import capitalize from "lodash/capitalize";

import {
  DeploymentEnvironment,
  TestTriggers,
  Trigger,
  TriggerFields,
} from "../../../lib/types";
import { copy } from "../../../theme/copy";
import Calendar from "../../shared-new/icons/Calendar";
import Clock from "../../shared-new/icons/Clock";
import Plug from "../../shared-new/icons/Plug";
import Rocket from "../../shared-new/icons/Rocket";

export type SelectState = "all" | "none" | "some";
export type TriggerMode = "api" | "deployment" | "schedule";

type BuildTriggerFields = {
  deployBranches: string | null;
  deployEnv: DeploymentEnvironment | null;
  deployIntegrationId: string | null;
  environmentId: string;
  mode: TriggerMode;
  name: string;
  repeatMinutes: number;
};

type BuildUpdateTestTriggersResponse = {
  addTriggerId: string;
  testIds: string[];
  testTriggers: TestTriggers[];
  removeTriggerId: string;
};

type GetSelectState = {
  testIds: string[];
  testTriggers: TestTriggers[];
  triggerId: string;
};

type GetDefaultName = {
  deployEnv: DeploymentEnvironment | null;
  mode: TriggerMode;
  repeatMinutes: number;
  triggers: Trigger[];
};

export const defaultRepeatMinutes = 24 * 60; // daily

const nullDeploymentFields = {
  deployment_branches: null,
  deployment_environment: null,
  deployment_integration_id: null,
};

export const buildTriggerFields = ({
  deployBranches,
  deployEnv,
  deployIntegrationId,
  environmentId,
  mode,
  name,
  repeatMinutes,
}: BuildTriggerFields): TriggerFields => {
  const constantFields = { environment_id: environmentId || null, name };

  if (mode === "schedule") {
    return {
      ...constantFields,
      ...nullDeploymentFields,
      repeat_minutes: repeatMinutes,
    };
  }

  if (mode === "deployment") {
    return {
      ...constantFields,
      deployment_branches: deployBranches || null,
      deployment_environment: ["preview", "production"].includes(deployEnv)
        ? deployEnv
        : null,
      deployment_integration_id: deployIntegrationId,
      repeat_minutes: null,
    };
  }

  return {
    ...constantFields,
    ...nullDeploymentFields,
    repeat_minutes: null,
  };
};

export const buildUpdateTestTriggersResponse = ({
  addTriggerId,
  removeTriggerId,
  testIds,
  testTriggers,
}: BuildUpdateTestTriggersResponse): TestTriggers[] => {
  const updatedTestTriggers = testTriggers.filter((t) =>
    testIds.includes(t.test_id)
  );

  return updatedTestTriggers.map((t) => {
    const trigger_ids = [...t.trigger_ids];

    if (addTriggerId) trigger_ids.push(addTriggerId);

    if (removeTriggerId) {
      const removeIndex = trigger_ids.indexOf(removeTriggerId);
      if (removeIndex > -1) trigger_ids.splice(removeIndex, 1);
    }

    return { test_id: t.test_id, trigger_ids };
  });
};

export const getDefaultMode = (trigger: Trigger | null): TriggerMode => {
  if (!trigger || trigger.repeat_minutes) return "schedule";
  if (trigger.deployment_integration_id) return "deployment";

  return "api";
};

export const getDefaultName = ({
  deployEnv,
  mode,
  repeatMinutes,
  triggers,
}: GetDefaultName): string => {
  let defaultName = copy.api;

  if (mode === "schedule") {
    defaultName = repeatMinutes === 60 ? copy.hourly : copy.daily;
  } else if (mode === "deployment") {
    defaultName = ["preview", "production"].includes(deployEnv)
      ? capitalize(`${deployEnv} ${copy.deployment}`)
      : copy.deployment;
  }

  if (triggers.some((t) => t.name === defaultName)) {
    return copy.triggerNamePlaceholder;
  }

  return defaultName;
};

export const getSelectState = ({
  testIds,
  testTriggers,
  triggerId,
}: GetSelectState): SelectState => {
  if (!testIds.length) return "none";

  const testFn = (testId: string): boolean => {
    const testTriggersForTest = testTriggers.find((t) => t.test_id === testId);
    return (testTriggersForTest?.trigger_ids || []).includes(triggerId);
  };

  if (testIds.every(testFn)) return "all";
  if (testIds.some(testFn)) return "some";

  return "none";
};

export const getTriggerIconComponent = (trigger: Trigger): Icon => {
  if (trigger.deployment_integration_id) return Rocket;
  if (trigger.repeat_minutes === 60) return Clock;
  if (trigger.repeat_minutes) return Calendar;

  return Plug;
};

export const labelTextProps = {
  color: "gray9",
  margin: { bottom: "small", top: "medium" },
  size: "componentBold" as const,
};

export const repeatMinutesOptions = [
  { label: copy.frequencyDaily, value: defaultRepeatMinutes },
  { label: copy.frequencyHourly, value: 60 },
];
