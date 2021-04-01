import crypto from "crypto";

import environment from "../environment";

export const hashUserId = (user_id: string): string => {
  const hmac = crypto.createHmac(
    "sha256",
    environment.INTERCOM_IDENTITY_SECRET
  );
  hmac.update(user_id);
  return hmac.digest("hex");
};
