import { db } from "../db";
import { ClientError } from "../errors";
import { Invite, ModelOptions } from "../types";
import { cuid, minutesFromNow } from "../utils";
import {
  findUser,
  randomWolfName,
  randomWolfNumber,
  randomWolfVariant,
} from "./user";

type CreateInvite = {
  creator_id: string;
  email: string;
  team_id: string;
};

type EnsureUserNotOnTeam = {
  team_id: string;
  user_id: string;
};

const ensureUserNotOnTeam = async (
  { team_id, user_id }: EnsureUserNotOnTeam,
  { logger, trx }: ModelOptions
): Promise<void> => {
  const teamUser = await (trx || db)
    .select("*")
    .from("team_users")
    .where({ team_id, user_id })
    .first();

  if (!teamUser) return;

  logger.error(`user ${user_id} already on team ${team_id}`);
  throw new ClientError("user already on team");
};

export const findInvitesForTeam = async (
  team_id: string,
  { logger, trx }: ModelOptions
): Promise<Invite[]> => {
  const log = logger.prefix("findInvitesForTeam");
  log.debug(team_id);

  const invites = await (trx || db)
    .select("*")
    .from("invites")
    .where("expires_at", ">", new Date())
    .andWhere({ accepted_at: null, team_id })
    .orderBy("email", "asc");

  log.debug(`found ${invites.length} invites for team ${team_id}`);

  return invites;
};

export const createInvite = async (
  { creator_id, email, team_id }: CreateInvite,
  { logger, trx }: ModelOptions
): Promise<Invite> => {
  const log = logger.prefix("createInvite");
  log.debug(`email ${email} and team ${team_id}`);

  const existingInvites = await findInvitesForTeam(team_id, { logger, trx });
  const existingInvite = existingInvites.find((invite) => {
    return invite.email === email;
  });

  if (existingInvite) {
    log.debug(`already exists ${existingInvite.id}`);
    return existingInvite;
  }

  const existingUser = await findUser({ email }, { logger, trx });
  if (existingUser) {
    await ensureUserNotOnTeam(
      { team_id, user_id: existingUser.id },
      { logger, trx }
    );
  }

  const invite = {
    accepted_at: null,
    creator_id,
    email,
    expires_at: minutesFromNow(14 * 24 * 60), // 2 weeks
    id: cuid(),
    team_id,
    wolf_name: existingUser?.wolf_name || randomWolfName(),
    wolf_number: existingUser?.wolf_number || randomWolfNumber(),
    wolf_variant: existingUser?.wolf_variant || randomWolfVariant(),
  };
  await (trx || db)("invites").insert(invite);

  log.debug("created", invite.id);

  return invite;
};

export const deleteInvite = async (
  id: string,
  { logger, trx }: ModelOptions
): Promise<void> => {
  const log = logger.prefix("deleteInvite");
  log.debug(id);

  const deleteCount = await (trx || db)("invites").where({ id }).del();
  log.debug(`delete ${deleteCount} invites`);
};

export const findInvite = async (
  id: string,
  { logger, trx }: ModelOptions
): Promise<Invite & { creator_email: string; team_name: string }> => {
  const log = logger.prefix("findInvite");
  log.debug(id);

  const invite = await (trx || db)
    .select("invites.*" as "*")
    .select("teams.name AS team_name")
    .select("users.email AS creator_email")
    .from("invites")
    .innerJoin("teams", "invites.team_id", "teams.id")
    .innerJoin("users", "invites.creator_id", "users.id")
    .where({ "invites.id": id })
    .first();

  if (!invite) {
    log.error("not found", id);
    throw new Error("invite not found");
  }

  log.debug("found", id);

  return invite;
};

export const updateInvite = async (
  id: string,
  { logger, trx }: ModelOptions
): Promise<Invite> => {
  const log = logger.prefix("updateInvite");
  log.debug(id);

  const invite = await (trx || db)
    .select("*")
    .from("invites")
    .where({ id })
    .first();

  if (!invite) {
    log.error("not found", id);
    throw new ClientError("invite not found");
  }

  if (invite.accepted_at) {
    log.error("already accepted", id);
    throw new ClientError("invite already accepted");
  }

  if (new Date(invite.expires_at) < new Date()) {
    log.error("expired", id);
    throw new ClientError("invite expired");
  }

  const timestamp = minutesFromNow();
  const updates = {
    accepted_at: timestamp,
    updated_at: timestamp,
  };

  await (trx || db)("invites").where({ id }).update(updates);
  log.debug("update invite", updates);

  return { ...invite, ...updates };
};
