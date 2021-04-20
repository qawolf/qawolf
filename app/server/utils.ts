import { randomBytes, scrypt } from "crypto";
import buildCuid from "cuid";
import * as EmailValidator from "email-validator";
import { v4 as uuidv4 } from "uuid";

import { ClientError } from "./errors";
import { Logger } from "./Logger";

type IsCorrectCode = {
  code: string;
  digest: string;
};

export type RunnerUrl = {
  id: string;
  location: string;
};

export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const API_KEY_PREFIX = "qawolf_";
export const GIT_TEST_FILE_EXTENSION = ".test.js";

export const randomChoice = <T>(items: T[] | string): T | string => {
  const randomIndex = Math.floor(Math.random() * items.length);

  return items[randomIndex];
};

export const buildApiKey = (): string => {
  // remove dashes
  const uuid = uuidv4().split("-").join("");

  return `${API_KEY_PREFIX}${uuid}`;
};

// https://dev.to/farnabaz/hash-your-passwords-with-scrypt-using-nodejs-crypto-module-316k
export const buildDigest = async (code: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(16).toString("hex");

    scrypt(code, salt, 64, (error, derivedKey) => {
      if (error) reject(error);
      resolve(salt + ":" + derivedKey.toString("hex"));
    });
  });
};

export const buildLoginCode = (length = 6): string => {
  let code = "";

  for (let i = 0; i < length; i++) {
    code += randomChoice(ALPHABET);
  }

  return code;
};

export const buildRunnerHost = (options: RunnerUrl): string => {
  if (options.location === "local") return `localhost`;

  return `${options.location}.qawolf.com/runner/${options.id}`;
};

export const buildRunnerStatusUrl = (options: RunnerUrl): string => {
  const protocol = options.location === "local" ? "http" : "https";
  return `${protocol}://${buildRunnerHost(options)}/.qawolf/runner/status`;
};

export const buildRunnerWsUrl = (options: RunnerUrl): string => {
  const protocol = options.location === "local" ? "ws" : "wss";
  return `${protocol}://${buildRunnerHost(options)}/.qawolf`;
};

export const cuid = (): string => buildCuid();

export const isCorrectCode = async ({
  code,
  digest,
}: IsCorrectCode): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const [salt, key] = digest.split(":");

    scrypt(code, salt, 64, (error, derivedKey) => {
      if (error) reject(error);
      resolve(key === derivedKey.toString("hex"));
    });
  });
};

export const validateEmail = (email: string, logger: Logger): void => {
  const isValid = EmailValidator.validate(email);
  if (isValid) return;

  logger.error(`email ${email} invalid`);
  throw new ClientError("invalid email address");
};
