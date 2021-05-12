import capitalize from "lodash/capitalize";

import { DeploymentProvider, Trigger, TriggerFields } from "../../../lib/types";
import { copy } from "../../../theme/copy";

export type TriggerMode = "deployment" | "schedule";

type BuildTriggerFields = {
  deployBranches: string | null;
  deployEnv: string | null;
  deployIntegrationId: string | null;
  deployProvider: DeploymentProvider | null;
  environmentId: string;
  mode: TriggerMode;
  name: string;
  repeatMinutes: number;
};

type GetDefaultName = {
  deployEnv: string | null;
  mode: TriggerMode;
  repeatMinutes: number;
  triggers: Trigger[];
};

export const defaultRepeatMinutes = 24 * 60; // daily

const nullDeploymentFields = {
  deployment_branches: null,
  deployment_environment: null,
  deployment_integration_id: null,
  deployment_provider: null,
};

export const buildTriggerFields = ({
  deployBranches,
  deployEnv,
  deployIntegrationId,
  deployProvider,
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

  return {
    ...constantFields,
    deployment_branches:
      deployBranches && deployProvider === "vercel" ? deployBranches : null,
    deployment_environment: deployEnv && deployEnv !== "all" ? deployEnv : null,
    deployment_integration_id: deployIntegrationId || null,
    deployment_provider: deployProvider,
    repeat_minutes: null,
  };
};

export const getDefaultMode = (trigger: Trigger | null): TriggerMode => {
  if (!trigger || trigger.repeat_minutes) return "schedule";

  return "deployment";
};

const getDeploymentName = (deployEnv: string): string => {
  if (["preview", "production"].includes(deployEnv)) {
    return capitalize(`${deployEnv} ${copy.deployment}`);
  }

  return copy.deployment;
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
    defaultName = getDeploymentName(deployEnv);
  }

  if (triggers.some((t) => t.name === defaultName)) {
    return copy.triggerNamePlaceholder;
  }

  return defaultName;
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
