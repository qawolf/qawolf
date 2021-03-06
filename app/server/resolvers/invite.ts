import {
  createInvite,
  findInvitesForTeam,
  updateInvite,
} from "../models/invite";
import { createTeamUser } from "../models/team_user";
import { sendEmailForInvite } from "../services/alert/email";
import { Context, CreateInviteMutation, IdQuery, Invite, Team } from "../types";
import { ensureTeamAccess, ensureUser } from "./utils";

/**
 * @returns The invite object
 */
export const acceptInviteResolver = async (
  _: Record<string, unknown>,
  { id }: IdQuery,
  { db, logger, user: contextUser }: Context
): Promise<Invite> => {
  const log = logger.prefix("acceptInviteResolver");
  log.debug("invite", id);

  const user = ensureUser({ logger, user: contextUser });

  return db.transaction(async (trx) => {
    const invite = await updateInvite(id, { db: trx, logger });

    await createTeamUser(
      { team_id: invite.team_id, user_id: user.id },
      { db: trx, logger }
    );

    return invite;
  });
};

/**
 *   Sends the emails immediately after creating the invites.
 * @returns An array of invite objects.
 */
export const createInvitesResolver = async (
  _: Record<string, unknown>,
  { emails, team_id }: CreateInviteMutation,
  { db, logger, teams, user }: Context
): Promise<Invite[]> => {
  const log = logger.prefix("createInviteResolver");
  log.debug(`team ${team_id}, emails ${emails.join(", ")}`);

  const { id } = ensureUser({ logger, user });
  ensureTeamAccess({ logger, team_id, teams });

  const promises = emails.map((email) => {
    return (async (): Promise<Invite> => {
      // TODO: ignore invalid emails
      const invite = await createInvite(
        { creator_id: id, email, team_id },
        { db, logger }
      );

      await sendEmailForInvite(invite.id, { db, logger });

      return invite;
    })();
  });

  const invites = await Promise.all(promises);
  return invites;
};

/**
 * @returns An array of invite objects.
 */
export const teamInvitesResolver = async (
  { id }: Team,
  _: Record<string, unknown>,
  { db, logger, teams }: Context
): Promise<Invite[]> => {
  const log = logger.prefix("teamInvitesResolver");
  log.debug(id);

  ensureTeamAccess({ logger, team_id: id, teams });

  return findInvitesForTeam(id, { db, logger });
};
