import isNil from "lodash/isNil";

import { minutesFromNow } from "../../shared/utils";
import { ModelOptions, Team, TeamPlan } from "../types";
import { buildApiKey, cuid } from "../utils";
import { decrypt, encrypt } from "./encrypt";
import { createDefaultEnvironments } from "./environment";
import { createTrigger, DEFAULT_TRIGGER_NAME } from "./trigger";

const DEFAULT_NAME = "My Team";

type UpdateTeam = {
  alert_integration_id?: string | null;
  helpers?: string;
  id: string;
  is_email_alert_enabled?: boolean;
  is_enabled?: boolean;
  name?: string;
  next_trigger_id?: string;
  plan?: TeamPlan;
  renewed_at?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
};

type ValidateApiKeyForTeam = {
  api_key: string;
  team_id: string;
};

export const createFreeTeamWithTrigger = async (
  creator_id: string,
  { db, logger }: ModelOptions
): Promise<Team> => {
  const id = cuid();

  const log = logger.prefix("createFreeTeamWithTrigger");
  log.debug(id);

  const team = {
    alert_integration_id: null,
    api_key: encrypt(buildApiKey()),
    helpers: "",
    id,
    is_email_alert_enabled: true,
    is_enabled: true,
    name: DEFAULT_NAME,
    next_trigger_id: cuid(),
    plan: "free" as const,
    renewed_at: null,
    stripe_customer_id: null,
    stripe_subscription_id: null,
  };

  await db("teams").insert(team);
  log.debug("created", team);

  await createTrigger(
    {
      creator_id,
      is_default: true,
      name: DEFAULT_TRIGGER_NAME,
      repeat_minutes: null,
      team_id: team.id,
    },
    { db, logger }
  );

  await createDefaultEnvironments(team.id, { db, logger });

  return team;
};

export const findTeam = async (
  id: string,
  { db, logger }: ModelOptions
): Promise<Team> => {
  const log = logger.prefix("findTeam");

  const team = await db.select("*").from("teams").where({ id }).first();

  if (!team) {
    log.error("not found", id);
    throw new Error("Team not found");
  }

  log.debug("found", id);

  return team;
};

export const findTeamsForUser = async (
  user_id: string,
  { db }: ModelOptions
): Promise<Team[] | null> => {
  const teams = await db
    .select("teams.*" as "*")
    .from("teams")
    .innerJoin("team_users", "teams.id", "team_users.team_id")
    .where({ user_id })
    .orderBy("name", "asc");

  return teams.length ? teams : null;
};

export const updateTeam = async (
  {
    alert_integration_id,
    helpers,
    id,
    is_email_alert_enabled,
    is_enabled,
    name,
    next_trigger_id,
    plan,
    renewed_at,
    stripe_customer_id,
    stripe_subscription_id,
  }: UpdateTeam,
  { db, logger }: ModelOptions
): Promise<Team> => {
  const log = logger.prefix("updateTeam");

  const updates: Partial<Team> = {
    updated_at: minutesFromNow(),
  };

  if (alert_integration_id !== undefined) {
    updates.alert_integration_id = alert_integration_id;
  }
  if (!isNil(helpers)) updates.helpers = helpers;
  if (!isNil(is_email_alert_enabled)) {
    updates.is_email_alert_enabled = is_email_alert_enabled;
  }
  if (!isNil(is_enabled)) updates.is_enabled = is_enabled;
  if (!isNil(name)) updates.name = name;
  if (next_trigger_id) updates.next_trigger_id = next_trigger_id;
  if (plan) updates.plan = plan;
  if (renewed_at) updates.renewed_at = renewed_at;
  if (stripe_customer_id) updates.stripe_customer_id = stripe_customer_id;
  if (stripe_subscription_id) {
    updates.stripe_subscription_id = stripe_subscription_id;
  }

  const team = await findTeam(id, { db, logger });
  await db("teams").where({ id }).update(updates);
  log.debug("updated", id, updates);

  return { ...team, ...updates };
};

export const validateApiKeyForTeam = async (
  { api_key, team_id }: ValidateApiKeyForTeam,
  { db, logger }: ModelOptions
): Promise<void> => {
  const log = logger.prefix("validateApiKeyForTeam");
  log.debug("team", team_id);

  const team = await findTeam(team_id, { db, logger });

  if (api_key !== decrypt(team.api_key)) {
    log.error("invalid api key");
    throw new Error("invalid api key");
  }
};
