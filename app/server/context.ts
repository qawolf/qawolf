import { NextApiRequest } from "next";

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
}: {
  req: NextApiRequest;
}): Promise<Context> => {
  const logger = new Logger({ prefix: "graphql" });

  const authToken = req.headers.authorization || "";

  const api_key = authToken.includes(API_KEY_PREFIX) ? authToken : null;
  const ip = formatIp((req.headers["x-forwarded-for"] as string) || null);
  const user_id = authToken.includes(API_KEY_PREFIX)
    ? null
    : verifyAccessToken(authToken);

  if (!user_id) {
    logger.debug("no current user");
    return { api_key, ip, logger, teams: null, user: null };
  }

  const user = await findUser({ id: user_id }, { logger });

  if (user && !user.is_enabled) {
    throw new AuthenticationError(
      "This account is disabled, email us at hello@qawolf.com"
    );
  }

  const teams = user ? await findTeamsForUser(user.id, { logger }) : null;
  const teamIds = teams?.map((team) => team.id);

  logger.debug(`user ${user?.id} teams ${teamIds}`);

  return { api_key, ip, logger, teams, user };
};
