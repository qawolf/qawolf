import jwt from "jsonwebtoken";

import environment from "../environment";

export const signAccessToken = (
  user_id: string,
  expiresIn: string = environment.JWT_EXPIRATION
): string => {
  const accessToken = jwt.sign({ user_id }, environment.JWT_SECRET, {
    expiresIn,
  });

  return accessToken;
};

export const verifyAccessToken = (accessToken: string): string | null => {
  if (!accessToken) return null; // default is empty string

  try {
    const decoded = jwt.verify(accessToken, environment.JWT_SECRET) as {
      user_id?: string;
    };

    return decoded.user_id || null;
  } catch (error) {
    return null;
  }
};
