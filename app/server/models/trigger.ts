import { minutesFromNow } from "../../shared/utils";
import { ClientError } from "../errors";
import { DeploymentProvider, ModelOptions, Trigger } from "../types";
import { cuid } from "../utils";

const DAILY_HOUR = 16; // 9 am PST
const MINUTES_PER_DAY = 24 * 60;
export const TRIGGER_COLORS = [
  "#4545E5",
  "#C54BDE",
  "#56BBD6",
  "#8BC22D",
  "#E59C59",
  "#DA4E94",
  "#ABB3C2",
  "#667080",
];

type CreateTrigger = {
  creator_id: string;
  deployment_branches?: string | null;
  deployment_environment?: string | null;
  deployment_integration_id?: string | null;
  deployment_provider?: DeploymentProvider | null;
  environment_id?: string;
  id?: string;
  name: string;
  repeat_minutes?: number | null;
  team_id: string;
};

type FindTriggersForNetlifyIntegration = {
  deployment_environment: string;
  team_id: string;
};

type UpdateTrigger = {
  deployment_branches?: string | null;
  deployment_environment?: string | null;
  deployment_integration_id?: string | null;
  deployment_provider?: DeploymentProvider | null;
  environment_id?: string | null;
  id: string;
  name?: string;
  repeat_minutes?: number | null;
};

export const buildTriggerColor = (
  triggers: Trigger[],
  colors: string[] = TRIGGER_COLORS
): string => {
  const availableColor = colors.find(
    (c) => !triggers.some((t) => t.color === c)
  );

  if (availableColor) return availableColor;

  return colors[triggers.length % colors.length];
};

const clearMinutes = (date: Date): void => {
  date.setUTCMinutes(0);
  date.setUTCSeconds(0);
  date.setUTCMilliseconds(0);
};

const formatBranches = (branches: string | null): string | null => {
  if (!branches) return null;

  return branches.split(/[\s,]+/).join(",");
};

export const getNextDay = (): string => {
  const date = new Date();
  // if already passed 9 am PST, schedule run for tomorrow
  if (date.getUTCHours() >= DAILY_HOUR) {
    date.setUTCDate(date.getUTCDate() + 1);
  }
  date.setUTCHours(DAILY_HOUR);
  clearMinutes(date);

  return date.toISOString();
};

export const getNextHour = (): string => {
  const date = new Date();

  date.setUTCHours(date.getUTCHours() + 1);
  clearMinutes(date);

  return date.toISOString();
};

export const getNextAt = (repeat_minutes: number | null): string | null => {
  if (!repeat_minutes) return null;

  if (repeat_minutes === 60) return getNextHour();
  if (repeat_minutes === MINUTES_PER_DAY) return getNextDay();

  throw new Error(`Cannot get next_at for repeat minutes ${repeat_minutes}`);
};

export const getUpdatedNextAt = ({
  next_at,
  repeat_minutes,
}: Trigger): string | null => {
  if (!next_at || !repeat_minutes) return null;

  const nextDate = new Date(next_at);
  nextDate.setMinutes(nextDate.getMinutes() + repeat_minutes);

  if (nextDate >= new Date()) {
    return nextDate.toISOString();
  }
  // if there was an issue such that jobs were delayed, reset next_at
  return getNextAt(repeat_minutes);
};

export const createTrigger = async (
  {
    creator_id,
    deployment_branches,
    deployment_environment,
    deployment_integration_id,
    deployment_provider,
    environment_id,
    id,
    name,
    repeat_minutes,
    team_id,
  }: CreateTrigger,
  { db, logger }: ModelOptions
): Promise<Trigger> => {
  const log = logger.prefix("createTrigger");

  log.debug(`create ${name} for team ${team_id}`);

  const teamTriggers = await findTriggersForTeam(team_id, { db, logger });

  const trigger = {
    color: buildTriggerColor(teamTriggers),
    creator_id,
    deleted_at: null,
    deployment_branches: formatBranches(deployment_branches),
    deployment_environment: deployment_environment || null,
    deployment_integration_id: deployment_integration_id || null,
    deployment_provider: deployment_provider || null,
    environment_id: environment_id || null,
    id: id || cuid(),
    name,
    next_at: getNextAt(repeat_minutes),
    repeat_minutes: repeat_minutes || null,
    team_id,
  };

  try {
    await db("triggers").insert(trigger);
  } catch (error) {
    if (error.message.includes("triggers_unique_name_team_id")) {
      throw new ClientError("trigger name must be unique");
    }

    throw error;
  }

  log.debug("created", trigger.id);

  return trigger;
};

export const findTrigger = async (
  id: string,
  { db, logger }: ModelOptions
): Promise<Trigger> => {
  const log = logger.prefix("findTrigger");
  log.debug("trigger", id);

  const trigger = await db("triggers").where({ id }).first();

  if (!trigger || trigger.deleted_at) {
    log.error(`not found ${id}`);
    throw new Error("trigger not found");
  }

  log.debug(`found ${id}`);
  return trigger;
};

export const findTriggerOrNull = async (
  id: string,
  { db, logger }: ModelOptions
): Promise<Trigger | null> => {
  const log = logger.prefix("findTriggerOrNull");
  log.debug(`find ${id}`);

  const trigger = await db("triggers").where({ id }).first();

  log.debug(trigger ? "found" : "not found");

  return trigger || null;
};

export const findTriggersForGitHubIntegration = async (
  github_repo_id: number,
  { db, logger }: ModelOptions
): Promise<Trigger[]> => {
  const log = logger.prefix("findTriggersForGitHubIntegration");
  log.debug("github repo", github_repo_id);

  const triggers = await db
    .select("triggers.*" as "*")
    .from("triggers")
    .innerJoin(
      "integrations",
      "triggers.deployment_integration_id",
      "integrations.id"
    )
    .where({
      "triggers.deleted_at": null,
      "integrations.github_repo_id": github_repo_id,
    })
    .orderBy("triggers.name", "asc");
  log.debug(`found ${triggers.length} triggers`);

  return triggers;
};

export const findTriggersForNetlifyIntegration = async (
  { deployment_environment, team_id }: FindTriggersForNetlifyIntegration,
  { db, logger }: ModelOptions
): Promise<Trigger[]> => {
  const log = logger.prefix("findTriggersForNetlifyIntegration");
  log.debug("team", team_id);

  const triggers = await db("triggers")
    .where((builder) => {
      builder
        .where({ deployment_environment })
        .orWhere({ deployment_environment: null });
    })
    .andWhere({
      deleted_at: null,
      deployment_provider: "netlify",
      team_id,
    })
    .orderBy("triggers.name", "asc");

  log.debug(`found ${triggers.length} triggers`);

  return triggers;
};

export const deleteTrigger = async (
  id: string,
  { db, logger }: ModelOptions
): Promise<Trigger> => {
  const log = logger.prefix("deleteTrigger");
  log.debug("trigger", id);

  const trigger = await findTrigger(id, { db, logger });

  const deleted_at = minutesFromNow();
  await db("triggers").where({ id }).update({ deleted_at });

  log.debug("deleted trigger", id);

  return { ...trigger, deleted_at };
};

export const findTriggersForTeam = async (
  team_id: string,
  { db, logger }: ModelOptions
): Promise<Trigger[]> => {
  const log = logger.prefix("findTriggersForTeam");

  log.debug(team_id);

  const triggers = await db
    .select("*")
    .from("triggers")
    .where({ deleted_at: null, team_id })
    .orderBy("name", "asc");

  log.debug(`found ${triggers.length} triggers for team ${team_id}`);

  return triggers;
};

export const findPendingTriggers = async ({
  db,
  logger,
}: ModelOptions): Promise<Trigger[]> => {
  const log = logger.prefix("findPendingTriggers");

  const triggers = await db
    .select("triggers.*" as "*")
    .from("triggers")
    .innerJoin("teams", "triggers.team_id", "teams.id")
    .whereNull("triggers.deleted_at")
    .andWhere("triggers.next_at", "<=", minutesFromNow())
    .andWhere({ "teams.is_enabled": true })
    .orderBy("next_at", "asc");

  log.debug(`found ${triggers.length} pending triggers`);

  return triggers;
};

export const updateTrigger = async (
  {
    deployment_branches,
    deployment_environment,
    deployment_integration_id,
    deployment_provider,
    environment_id,
    id,
    name,
    repeat_minutes,
  }: UpdateTrigger,
  { db, logger }: ModelOptions
): Promise<Trigger> => {
  const log = logger.prefix("updateTrigger");
  log.debug(`update trigger ${id} name ${name}`);

  return db.transaction(async (trx) => {
    const existingTrigger = await findTrigger(id, { db, logger });

    const updates: Partial<Trigger> = {
      updated_at: minutesFromNow(),
    };

    if (deployment_branches !== undefined) {
      updates.deployment_branches = formatBranches(deployment_branches);
    }
    if (deployment_environment !== undefined) {
      updates.deployment_environment = deployment_environment;
    }
    if (deployment_integration_id !== undefined) {
      updates.deployment_integration_id = deployment_integration_id;
    }
    if (deployment_provider !== undefined) {
      updates.deployment_provider = deployment_provider;
    }
    if (environment_id !== undefined) {
      updates.environment_id = environment_id;
    }
    if (name !== undefined) updates.name = name;

    if (repeat_minutes !== undefined) {
      updates.repeat_minutes = repeat_minutes;
      updates.next_at = getNextAt(repeat_minutes);
    }

    try {
      await trx("triggers").update(updates).where({ id });
    } catch (error) {
      if (error.message.includes("triggers_unique_name_team_id")) {
        throw new ClientError("trigger name must be unique");
      }

      throw error;
    }

    log.debug("updated trigger", id, updates);

    return { ...existingTrigger, ...updates };
  });
};

// TODO make this part of updateTrigger
export const updateTriggerNextAt = async (
  trigger: Trigger,
  { db, logger }: ModelOptions
): Promise<void> => {
  const log = logger.prefix("updateTriggerNextAt");

  const next_at = getUpdatedNextAt(trigger);

  await db("triggers")
    .update({ next_at, updated_at: minutesFromNow() })
    .where({ id: trigger.id });

  log.debug(
    `updated trigger ${trigger.id} repeat_minutes ${trigger.repeat_minutes} next_at ${next_at}`
  );
};
