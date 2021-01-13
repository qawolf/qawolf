import { db } from "../db";
import { ClientError } from "../errors";
import {
  CreateUserWithEmail,
  CreateUserWithGitHub,
  GitHubFields,
  ModelOptions,
  User,
} from "../types";
import {
  buildDigest,
  cuid,
  isCorrectCode,
  minutesFromNow,
  randomChoice,
  validateEmail,
} from "../utils";
import { WOLF_NAMES, WOLF_VARIANTS } from "./wolfOptions";

type AuthenticateUser = {
  email: string;
  login_code: string;
};

type FindUser = {
  email?: string;
  github_id?: number;
  id?: string | null;
};

type UpdateUser = {
  id: string;
  login_code?: string | null;
  onboarded_at?: string;
};

export const EXPIRED_CODE_ERROR =
  "That code is expired, check your email for a new code and try again";
const INVALID_CODE_ERROR = "That code wasn't valid, please try again";
const LOGIN_CODE_EXPIRY_MINUTES = 30;

export const randomWolfName = (): string => {
  return randomChoice(WOLF_NAMES);
};

export const randomWolfNumber = (digits = 6): number => {
  const floor = Math.pow(10, digits - 1);
  return Math.floor(floor + Math.random() * floor * 9);
};

export const randomWolfVariant = (): string => {
  return randomChoice(WOLF_VARIANTS);
};

export const buildWolfVariant = (wolfVariant?: string | null): string => {
  if (wolfVariant && WOLF_VARIANTS.includes(wolfVariant)) return wolfVariant;
  return randomWolfVariant();
};

export const createUserWithEmail = async (
  fields: CreateUserWithEmail,
  { logger, trx }: ModelOptions
): Promise<User> => {
  const log = logger.prefix("createUserWithEmail");

  log.debug("email", fields.email);

  validateEmail(fields.email, logger);

  const user = {
    avatar_url: null,
    email: fields.email,
    github_id: null,
    github_login: null,
    id: cuid(),
    is_enabled: true,
    login_code_digest: await buildDigest(fields.login_code),
    login_code_expires_at: minutesFromNow(LOGIN_CODE_EXPIRY_MINUTES),
    name: null,
    onboarded_at: null,
    wolf_name: fields.wolf_name || randomWolfName(),
    wolf_number: fields.wolf_number || randomWolfNumber(),
    wolf_variant: buildWolfVariant(fields.wolf_variant),
  };
  await (trx || db)("users").insert(user);

  log.debug("created", user.id);

  return user;
};

export const createUserWithGitHub = async (
  fields: CreateUserWithGitHub,
  { logger, trx }: ModelOptions
): Promise<User> => {
  const log = logger.prefix("createUserWithGitHub");

  log.debug("fields", fields);

  const user = {
    ...fields,
    id: cuid(),
    is_enabled: true,
    login_code_digest: null,
    login_code_expires_at: null,
    onboarded_at: null,
    wolf_name: fields.wolf_name || randomWolfName(),
    wolf_number: fields.wolf_number || randomWolfNumber(),
    wolf_variant: buildWolfVariant(fields.wolf_variant),
  };
  await (trx || db)("users").insert(user);

  log.debug("created", user.id);

  return user;
};

export const findUser = async (
  findOptions: FindUser,
  { logger, trx }: ModelOptions
): Promise<User | null> => {
  const log = logger.prefix("findUser");

  const { email, id, github_id } = findOptions;

  if (!email && !id && !github_id) {
    log.error("no id provided");
    throw new Error("Must provide user id, email, or GitHub id");
  }

  const query = (trx || db)("users").select("*");
  if (email) query.orWhere({ email });
  if (id) query.orWhere({ id });
  if (github_id) query.orWhere({ github_id });

  const user = await query.first();

  if (!user) {
    log.debug("not found", findOptions);
  }

  return user || null;
};

export const authenticateUser = async (
  { email, login_code }: AuthenticateUser,
  { logger, trx }: ModelOptions
): Promise<User> => {
  const log = logger.prefix("authenticateUser");
  log.debug(email);

  const user = await findUser({ email }, { logger, trx });

  if (!user || !user.login_code_digest || !user.login_code_expires_at) {
    log.error(`user not found ${email}`);
    throw new Error("User not found");
  }
  if (
    !(await isCorrectCode({
      code: login_code.toUpperCase(),
      digest: user.login_code_digest,
    }))
  ) {
    log.error(`wrong code ${user.email}`);
    throw new ClientError(INVALID_CODE_ERROR);
  }
  if (new Date(user.login_code_expires_at) < new Date()) {
    log.error(`expired code ${user.email}`);
    throw new ClientError(EXPIRED_CODE_ERROR);
  }

  const updates = {
    login_code_digest: null,
    login_code_expires_at: null,
    updated_at: minutesFromNow(),
  };
  await (trx || db)("users").where({ id: user.id }).update(updates);

  log.debug(`authenticated ${user.email}`);

  return { ...user, ...updates };
};

export const findUsersForTeam = async (
  team_id: string,
  { logger, trx }: ModelOptions
): Promise<User[]> => {
  const log = logger.prefix("findUsersForTeam");
  log.debug(team_id);

  const users = await (trx || db)
    .select("users.*" as "*")
    .from("users")
    .innerJoin("team_users", "team_users.user_id", "users.id")
    .orderBy("email", "asc")
    .where({ "team_users.team_id": team_id });

  log.debug(`found ${users.length} users for team ${team_id}`);

  return users;
};

export const updateGitHubFields = async (
  id: string,
  gitHubFields: Partial<GitHubFields>,
  { logger, trx }: ModelOptions
): Promise<User> => {
  const log = logger.prefix("updateGitHubFields");
  log.debug(gitHubFields);

  const updates = { ...gitHubFields, updated_at: minutesFromNow() };

  const user = await (trx || db).transaction(async (trx) => {
    const existingUser = await findUser({ id }, { logger, trx });

    await trx("users").where({ id }).update(updates);

    return { ...existingUser, ...updates };
  });

  log.debug("updated", id, updates);

  return user;
};

export const updateUser = async (
  { id, login_code, onboarded_at }: UpdateUser,
  { logger, trx }: ModelOptions
): Promise<User> => {
  const log = logger.prefix("updateUser");
  log.debug(id);

  const existingUser = await findUser({ id }, { logger, trx });

  if (!existingUser) {
    log.error("user not found", id);
    throw new Error("User not found");
  }

  const updates: Partial<User> = {
    updated_at: minutesFromNow(),
  };

  if (login_code) {
    updates.login_code_digest = await buildDigest(login_code);
    updates.login_code_expires_at = minutesFromNow(LOGIN_CODE_EXPIRY_MINUTES);
  }
  if (onboarded_at) {
    updates.onboarded_at = onboarded_at;
  }

  if (Object.keys(updates).length < 2) {
    throw new Error("No updates provided");
  }

  await (trx || db)("users").where({ id }).update(updates);

  log.debug("updated", id);

  return { ...existingUser, ...updates };
};
