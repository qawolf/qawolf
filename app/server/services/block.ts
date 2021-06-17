import isNil from "lodash/isNil";

import { ClientError } from "../errors";
import { Logger } from "../Logger";
import { getS3Set } from "./aws/storage";

const DENY_CONFIG = {
  bucket: "qawolf-ops",
  domains_key: "blocked-domains.txt",
  ips_key: "blocked-ips.txt",
};

export const ensureEmailAllowed = async (
  email: string | undefined,
  logger: Logger
): Promise<void> => {
  if (isNil(email)) return;

  const log = logger.prefix("ensureEmailAllowed");

  let blockedDomains = new Set<string>();
  try {
    blockedDomains = await getS3Set(
      DENY_CONFIG.bucket,
      DENY_CONFIG.domains_key
    );
  } catch (e) {
    log.alert("could not load blocked ips", e.toString());
  }

  const domain = email.split("@").pop().toLowerCase().trim();
  if (blockedDomains.has(domain)) {
    log.debug(`blocked ${email}`);
    throw new ClientError("Please use your company email address to sign up");
  }
};

export const ensureIpAllowed = async (
  ip: string,
  logger: Logger
): Promise<void> => {
  if (isNil(ip)) return;

  const log = logger.prefix("ensureIpAllowed");

  let blockedIps = new Set<string>();
  try {
    blockedIps = await getS3Set(DENY_CONFIG.bucket, DENY_CONFIG.ips_key);
  } catch (e) {
    log.alert("could not load blocked ips", e.toString());
  }

  if (blockedIps.has(ip)) {
    log.debug(`blocked ${ip}`);
    throw new ClientError("Please contact hello@qawolf.com to sign up");
  }
};
