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

export type TriggerMode = "deployment" | "onDemand" | "schedule";

type BuildTriggerFields = {
  deployBranches: string | null;
  deployEnv: DeploymentEnvironment | null;
  deployIntegrationId: string | null;
  environmentId: string | null;
  mode: TriggerMode;
  name: string;
  repeatMinutes: number;
};

type GetIsSelected = {
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
  const constantFields = { environment_id: environmentId, name };

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
      deployment_branches: deployBranches,
      deployment_environment: deployEnv,
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

export const getDefaultMode = (trigger: Trigger | null): TriggerMode => {
  if (!trigger || trigger.repeat_minutes) return "schedule";
  if (trigger.deployment_integration_id) return "deployment";

  return "onDemand";
};

export const getDefaultName = ({
  deployEnv,
  mode,
  repeatMinutes,
  triggers,
}: GetDefaultName): string => {
  let defaultName = copy.onDemand;

  if (mode === "schedule") {
    defaultName = repeatMinutes === 60 ? copy.hourly : copy.daily;
  } else if (mode === "deployment") {
    defaultName = deployEnv
      ? capitalize(`${deployEnv} ${copy.deployment}`)
      : copy.deployment;
  }

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
  margin: { bottom: "small", top: "medium" },
  size: "componentBold" as const,
};

export const repeatMinutesOptions = [
  { label: copy.frequencyDaily, value: defaultRepeatMinutes },
  { label: copy.frequencyHourly, value: 60 },
];
