import isNil from "lodash/isNil";

import { minutesFromNow } from "../../shared/utils";
import environment from "../environment";
import { ModelOptions, Team, TeamPlan } from "../types";
import { buildApiKey, cuid } from "../utils";
import { decrypt, encrypt } from "./encrypt";

const DEFAULT_NAME = "My Team";

type UpdateTeam = {
  alert_integration_id?: string | null;
  alert_only_on_failure?: boolean;
  helpers?: string;
  helpers_version?: number;
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

export const formatTeam = (team: Team): Team => {
  return { ...team, api_key: decrypt(team.api_key) };
};

export const createDefaultTeam = async ({
  db,
  logger,
}: ModelOptions): Promise<Team> => {
  const id = cuid();

  const log = logger.prefix("createDefaultTeam");
  log.debug(id);

  const team = {
    alert_integration_id: null,
    api_key: encrypt(buildApiKey()),
    helpers: "",
    helpers_version: 0,
    id,
    inbox: `${cuid()}@${environment.EMAIL_DOMAIN}`,
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

  return formatTeam(team);
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

  return formatTeam(team);
};

export const findTeamForEmail = async (
  email: string,
  { db, logger }: ModelOptions
): Promise<Team | null> => {
  const log = logger.prefix("findTeamForEmail");

  log.debug("email", email);

  let inbox = email;
  if (email.includes("+")) {
    const [prefix, suffix] = email.split("+");
    inbox = prefix + "@" + suffix.split("@")[1];
  }

  const team = await db("teams").where({ inbox }).first();

  log.debug(team ? `found ${team.id}` : "not found");

  return team || null;
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

  return teams.length ? teams.map((t: Team) => formatTeam(t)) : null;
};

export const updateTeam = async (
  {
    alert_integration_id,
    alert_only_on_failure,
    helpers,
    helpers_version,
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
  const team = await findTeam(id, { db, logger });

  const updates: Partial<Team> = {
    updated_at: minutesFromNow(),
  };

  if (alert_integration_id !== undefined) {
    updates.alert_integration_id = alert_integration_id;
  }
  if (!isNil(alert_only_on_failure)) {
    updates.alert_only_on_failure = alert_only_on_failure;
  }

  if (!isNil(helpers)) updates.helpers = helpers;
  // do not overwrite current helpers with older version
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  if (!isNil(helpers_version) && team.helpers_version >= helpers_version!) {
    log.debug(
      `ignore: team ${id} current helpers version ${team.helpers_version} >= update version ${helpers_version}`
    );
    return team;
  } else if (!isNil(helpers_version)) {
    updates.helpers_version = helpers_version;
  }

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

  if (api_key !== team.api_key) {
    log.error("invalid api key");
    throw new Error("invalid api key");
  }
};
