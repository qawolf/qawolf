import isNil from "lodash/isNil";

import { db } from "../db";
import { ModelOptions, Team, TeamPlan } from "../types";
import { cuid, minutesFromNow } from "../utils";
import { createGroup, DEFAULT_GROUP_NAME } from "./group";

const DEFAULT_NAME = "My Team";

type UpdateTeam = {
  id: string;
  is_enabled?: boolean;
  name?: string;
  plan?: TeamPlan;
  renewed_at?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
};

export const createFreeTeamWithGroup = async (
  creator_id: string,
  { logger, trx }: ModelOptions
): Promise<Team> => {
  const id = cuid();

  const log = logger.prefix("createFreeTeamWithGroup");
  log.debug(id);

  const team = {
    id,
    is_enabled: true,
    name: DEFAULT_NAME,
    plan: "free" as const,
    renewed_at: null,
    stripe_customer_id: null,
    stripe_subscription_id: null,
  };

  await (trx || db)("teams").insert(team);
  log.debug("created", team);

  await createGroup(
    {
      creator_id,
      is_default: true,
      name: DEFAULT_GROUP_NAME,
      repeat_minutes: null,
      team_id: team.id,
    },
    { logger, trx }
  );

  return team;
};

export const findTeam = async (
  id: string,
  { logger, trx }: ModelOptions
): Promise<Team> => {
  const log = logger.prefix("findTeam");

  const team = await (trx || db)
    .select("*")
    .from("teams")
    .where({ id })
    .first();

  if (!team) {
    log.error("not found", id);
    throw new Error("Team not found");
  }

  log.debug("found", id);

  return team;
};

export const findTeamsForUser = async (
  user_id: string,
  { trx }: ModelOptions
): Promise<Team[] | null> => {
  const teams = await (trx || db)
    .select("teams.*" as "*")
    .from("teams")
    .innerJoin("team_users", "teams.id", "team_users.team_id")
    .where({ user_id })
    .orderBy("name", "asc");

  return teams.length ? teams : null;
};

export const updateTeam = async (
  {
    id,
    is_enabled,
    name,
    plan,
    renewed_at,
    stripe_customer_id,
    stripe_subscription_id,
  }: UpdateTeam,
  { logger, trx }: ModelOptions
): Promise<Team> => {
  const log = logger.prefix("updateTeam");

  const updates: Partial<Team> = {
    updated_at: minutesFromNow(),
  };

  if (!isNil(is_enabled)) updates.is_enabled = is_enabled;
  if (!isNil(name)) updates.name = name;
  if (plan) updates.plan = plan;
  if (renewed_at) updates.renewed_at = renewed_at;
  if (stripe_customer_id) updates.stripe_customer_id = stripe_customer_id;
  if (stripe_subscription_id) {
    updates.stripe_subscription_id = stripe_subscription_id;
  }

  const team = await findTeam(id, { logger });
  await (trx || db)("teams").where({ id }).update(updates);
  log.debug("updated", id, updates);

  return { ...team, ...updates };
};
