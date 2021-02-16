import { NextApiRequest, NextApiResponse } from "next";

import environment from "./environment";
import { AuthenticationError } from "./errors";
import { Logger } from "./Logger";
import { findTeamsForUser } from "./models/team";
import { findUser } from "./models/user";
import { verifyAccessToken } from "./services/access";
import { Context } from "./types";
import { API_KEY_PREFIX } from "./utils";

const formatIp = (ip: string | null): string | null => {
  if (!ip) return null;

  const formattedIp = new URL(`http://${ip}`).hostname;

  return formattedIp;
};

export const context = async ({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}): Promise<Context> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = (req as any).db;

  if (!db) throw new Error("db must be provided to request");

  const logger = new Logger({ prefix: "graphql" });

  const authToken = req.headers.authorization || "";

  const api_key = authToken.includes(API_KEY_PREFIX) ? authToken : null;
  const ip = formatIp((req.headers["x-forwarded-for"] as string) || null);
  const user_id = authToken.includes(API_KEY_PREFIX)
    ? null
    : verifyAccessToken(authToken);

  if (!user_id) {
    logger.debug("no current user");
    return { api_key, db, ip, logger, teams: null, user: null };
  }

  const user = await findUser({ id: user_id }, { db, logger });

  if (user && !user.is_enabled) {
    throw new AuthenticationError(
      "This account is disabled, email us at hello@qawolf.com"
    );
  }

  const teams = user ? await findTeamsForUser(user.id, { db, logger }) : null;
  const teamIds = teams?.map((team) => team.id);

  logger.debug(`user ${user?.id} teams ${teamIds}`);

  // include version in response header
  res.setHeader("version", environment.VERCEL_GIT_COMMIT_SHA.slice(0, 7));

  return { api_key, db, ip, logger, teams, user };
};
