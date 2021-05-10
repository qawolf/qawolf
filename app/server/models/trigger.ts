import { DateTime } from "luxon";
import { Frequency, RRule } from "rrule";

import { minutesFromNow } from "../../shared/utils";
import { ClientError } from "../errors";
import { DeploymentProvider, ModelOptions, Trigger } from "../types";
import { cuid } from "../utils";
import { buildColor } from "./utils";

type GetNextAt = {
  repeat_minutes?: number | null;
  start_at?: string;
  // see https://github.com/vvo/tzdb/blob/a22590b6597865200d99716d467a82872fb66b81/time-zones-names.json
  timezone_id?: string;
};

type CreateTrigger = GetNextAt & {
  creator_id: string;
  deployment_branches?: string | null;
  deployment_environment?: string | null;
  deployment_integration_id?: string | null;
  deployment_provider?: DeploymentProvider | null;
  environment_id?: string;
  name: string;
  start_at?: Date;
  timezone_id?: string;
  team_id: string;
};

type FindTriggersForNetlifyIntegration = {
  deployment_environment: string;
  team_id: string;
};

type UpdateTrigger = GetNextAt & {
  deployment_branches?: string | null;
  deployment_environment?: string | null;
  deployment_integration_id?: string | null;
  deployment_provider?: DeploymentProvider | null;
  environment_id?: string | null;
  id: string;
  name?: string;
};

const formatBranches = (branches: string | null): string | null => {
  if (!branches) return null;

  return branches.split(/[\s,]+/).join(",");
};

export const createTrigger = async (
  {
    creator_id,
    deployment_branches,
    deployment_environment,
    deployment_integration_id,
    deployment_provider,
    environment_id,
    name,
    repeat_minutes,
    start_at,
    team_id,
    timezone_id,
  }: CreateTrigger,
  { db, logger }: ModelOptions
): Promise<Trigger> => {
  const log = logger.prefix("createTrigger");

  log.debug(`create ${name} for team ${team_id}`);

  const teamTriggers = await findTriggersForTeam(team_id, { db, logger });

  const trigger = {
    color: buildColor(teamTriggers.map((t) => t.color)),
    creator_id,
    deleted_at: null,
    deployment_branches: formatBranches(deployment_branches),
    deployment_environment: deployment_environment || null,
    deployment_integration_id: deployment_integration_id || null,
    deployment_provider: deployment_provider || null,
    environment_id: environment_id || null,
    id: cuid(),
    name,
    next_at: getNextAt({ repeat_minutes, start_at, timezone_id }),
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

function setPartsToUTCDate(date: Date) {
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    )
  );
}

export const getNextAt = ({
  repeat_minutes,
  start_at,
  timezone_id,
}: GetNextAt): string | null => {
  if (!repeat_minutes) return null;

  let freq: Frequency = RRule.MINUTELY;
  let interval = repeat_minutes;
  if (repeat_minutes === 60) {
    freq = RRule.HOURLY;
    interval = 1;
  } else if (repeat_minutes === 24 * 60) {
    freq = RRule.DAILY;
    interval = 1;
  }

  // default to 9am
  const dtstart = start_at
    ? new Date(start_at)
    : new Date(Date.UTC(2021, 1, 1, 9, 0, 0));

  // default to pacific timezone
  const tzid = timezone_id || "America/Los_Angeles";

  const rule = new RRule({ dtstart, freq, interval, tzid });

  // In rrule, "UTC" dates are interpreted as dates in your local timezone
  // So we need to turn the current date into a UTC date
  // https://github.com/jakubroztocil/rrule#important-use-utc-dates
  const nextAt = rule.after(setPartsToUTCDate(new Date()));

  // Then we have to convert their date back to our local date
  return DateTime.fromJSDate(nextAt)
    .toUTC()
    .setZone("local", { keepLocalTime: true })
    .toJSDate()
    .toISOString();
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
    start_at,
    timezone_id,
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

    if (repeat_minutes !== undefined) updates.repeat_minutes = repeat_minutes;
    if (start_at !== undefined) updates.start_at = start_at;
    if (timezone_id !== undefined) updates.timezone_id = timezone_id;

    if (
      repeat_minutes !== undefined ||
      start_at !== undefined ||
      timezone_id !== undefined
    ) {
      updates.next_at = getNextAt({
        repeat_minutes:
          repeat_minutes !== undefined
            ? repeat_minutes
            : existingTrigger.repeat_minutes,
        start_at: start_at || existingTrigger.start_at,
        timezone_id: timezone_id || existingTrigger.timezone_id,
      });
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
