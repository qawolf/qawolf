import environment from "../environment";
import { findInvite } from "../models/invite";
import { createDefaultTeam, findTeamsForUser } from "../models/team";
import { createTeamUser } from "../models/team_user";
import {
  authenticateUser,
  createUserWithEmail,
  createUserWithGitHub,
  EXPIRED_CODE_ERROR,
  findUser,
  findUsersForTeam,
  updateGitHubFields,
  updateUser,
} from "../models/user";
import { signAccessToken } from "../services/access";
import { sendEmailForLoginCode } from "../services/alert/email";
import { postMessageToSlack } from "../services/alert/slack";
import { findGitHubFields } from "../services/gitHub/user";
import {
  AuthenticatedUser,
  Context,
  CreateUserWithEmail,
  CreateUserWithGitHub,
  CurrentUser,
  ModelOptions,
  SendLoginCode,
  SendLoginCodeMutation,
  SignInWithEmailMutation,
  SignInWithGitHubMutation,
  Team,
  UpdateUserMutation,
  User,
} from "../types";
import { buildLoginCode } from "../utils";
import { ensureTeamAccess, ensureUser } from "./utils";

type CreateUserWithTrigger = {
  emailFields?: CreateUserWithEmail;
  gitHubFields?: CreateUserWithGitHub;
  hasInvite?: boolean;
};

const buildAuthenticatedUser = async (
  user: User,
  options: ModelOptions
): Promise<AuthenticatedUser> => {
  const access_token = signAccessToken(user.id);
  const teams = await findTeamsForUser(user.id, options);

  return {
    access_token,
    user: { ...user, teams: teams || [] },
  };
};

const postNewUserMessageToSlack = async (
  email: string,
  github_login?: string
): Promise<void> => {
  if (environment.SLACK_UPDATES_WEBHOOK) {
    const detail = github_login ? `GitHub (${github_login})` : `email`;

    return postMessageToSlack({
      message: {
        text: `👋 New user: ${email} just signed up with ${detail}!`,
      },
      webhook_url: environment.SLACK_UPDATES_WEBHOOK,
    });
  }
};

const createUserWithTeam = async (
  { emailFields, gitHubFields, hasInvite }: CreateUserWithTrigger,
  { db, logger }: ModelOptions
): Promise<User> => {
  if (!emailFields && !gitHubFields) {
    logger.error("createUserWithTrigger: no fields provided");
    throw new Error("Could not create user");
  }

  postNewUserMessageToSlack(
    emailFields?.email || gitHubFields?.email,
    gitHubFields?.github_login
  ).catch((error) => {
    logger.alert("could not send slack message", error.message);
  });

  return db.transaction(async (trx) => {
    const user = gitHubFields
      ? await createUserWithGitHub(gitHubFields, { db: trx, logger })
      : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await createUserWithEmail(emailFields!, { db: trx, logger });

    if (!hasInvite) {
      const team = await createDefaultTeam({
        db: trx,
        logger,
      });

      await createTeamUser(
        { team_id: team.id, user_id: user.id },
        { db: trx, logger }
      );
    }

    return user;
  });
};

/**
 * @returns The user associated with the request authentication token, or null if not logged in
 */
export const currentUserResolver = async (
  _: Record<string, unknown>,
  __: Record<string, unknown>,
  { logger, teams, user: contextUser }: Context
): Promise<CurrentUser | null> => {
  const log = logger.prefix("currentUserResolver");
  if (!contextUser) {
    log.debug("no current user");
    return null;
  }

  const currentUser = { ...contextUser, teams: teams || [] };

  log.debug("current user", currentUser.id);

  return currentUser;
};

/**
 * @returns A response object containing the email address the code was sent to
 */
export const sendLoginCodeResolver = async (
  _: Record<string, unknown>,
  { email, invite_id, is_subscribed }: SendLoginCodeMutation,
  { db, logger }: Context
): Promise<SendLoginCode> => {
  const log = logger.prefix("sendLoginCodeResolver");
  log.debug(email);

  let user = await findUser({ email }, { db, logger });
  const login_code = buildLoginCode();

  if (user) {
    log.debug(`user ${email} already created`);
    user = await updateUser({ id: user.id, login_code }, { db, logger });
  } else {
    const invite = invite_id
      ? await findInvite(invite_id, { db, logger })
      : null;

    user = await createUserWithTeam(
      {
        emailFields: {
          email,
          login_code,
          wolf_name: invite?.wolf_name,
          wolf_number: invite?.wolf_number,
          wolf_variant: invite?.wolf_variant,
        },
        hasInvite: !!invite,
      },
      { db, logger }
    );

    log.debug(`create new user ${user.id} from email ${email}`);
  }

  await sendEmailForLoginCode({ logger, login_code, user });

  return { email: user.email };
};

/**
 * @returns A response object with access_token and the user record
 */
export const signInWithEmailResolver = async (
  _: Record<string, unknown>,
  { email, login_code }: SignInWithEmailMutation,
  { db, logger }: Context
): Promise<AuthenticatedUser> => {
  const log = logger.prefix("signInWithEmailResolver");
  log.debug(email);

  try {
    const user = await authenticateUser({ email, login_code }, { db, logger });

    return buildAuthenticatedUser(user, { db, logger });
  } catch (error) {
    // if code is expired, send a new one
    if (error.message === EXPIRED_CODE_ERROR) {
      const login_code = buildLoginCode();

      const user = await db.transaction(async (trx) => {
        const oldUser = await findUser({ email }, { db: trx, logger });
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return updateUser({ id: oldUser!.id, login_code }, { db: trx, logger });
      });

      await sendEmailForLoginCode({ logger, login_code, user });
    }

    throw error;
  }
};

/**
 * @returns A response object with access_token and the user record
 */
export const signInWithGitHubResolver = async (
  _: Record<string, unknown>,
  {
    github_code,
    github_state,
    invite_id,
    is_subscribed,
  }: SignInWithGitHubMutation,
  { db, logger }: Context
): Promise<AuthenticatedUser> => {
  const log = logger.prefix("signInWithGitHubResolver");
  const gitHubFields = await findGitHubFields({
    github_code,
    github_state,
  });
  const existingUser = await findUser(
    // look up by email OR GitHub ID
    { email: gitHubFields.email, github_id: gitHubFields.github_id },
    { db, logger }
  );

  let user: User;

  if (existingUser) {
    // do not overwrite existing user email address in case
    // the new email address is already taken
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { email, ...gitHubFieldsWithoutEmail } = gitHubFields;

    user = await updateGitHubFields(existingUser.id, gitHubFieldsWithoutEmail, {
      db,
      logger,
    });
    log.debug(
      `update existing user ${user.id} from GitHub ${user.github_login}`
    );
  } else {
    const invite = invite_id
      ? await findInvite(invite_id, { db, logger })
      : null;

    user = await createUserWithTeam(
      {
        gitHubFields: {
          ...gitHubFields,
          wolf_name: invite?.wolf_name,
          wolf_number: invite?.wolf_number,
          wolf_variant: invite?.wolf_variant,
        },
        hasInvite: !!invite,
      },
      { db, logger }
    );

    log.debug(`create new user ${user.id} from GitHub ${user.github_login}`);
  }

  return buildAuthenticatedUser(user, { db, logger });
};

/**
 * @returns An array of invite objects.
 */
export const teamUsersResolver = async (
  { id }: Team,
  _: Record<string, unknown>,
  { db, logger, teams }: Context
): Promise<User[]> => {
  const log = logger.prefix("teamUsersResolver");
  log.debug(id);

  ensureTeamAccess({ logger, team_id: id, teams });

  return findUsersForTeam(id, { db, logger });
};

/**
 * @returns The updated user record
 */
export const updateUserResolver = async (
  _: Record<string, unknown>,
  args: UpdateUserMutation,
  { db, logger, teams, user: contextUser }: Context
): Promise<CurrentUser> => {
  const user = ensureUser({ logger, user: contextUser });

  logger.debug("updateUserResolver", user.id, args);

  const updatedUser = await updateUser(
    { id: user.id, ...args },
    { db, logger }
  );

  return { ...updatedUser, teams: teams || [] };
};
