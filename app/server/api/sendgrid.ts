import { IncomingForm } from "formidable";
import { NextApiRequest, NextApiResponse } from "next";

import environment from "../environment";
import { AuthenticationError } from "../errors";
import { Logger } from "../Logger";
import { createEmail } from "../models/email";
import { findTeamForEmail } from "../models/team";
import { ModelOptions } from "../types";

type EmailFields = {
  from: string;
  html: string;
  subject: string;
  text: string;
  to: string;
};

export const buildEmailFields = async (
  req: NextApiRequest
): Promise<EmailFields> => {
  return new Promise((resolve, reject): void => {
    const form = new IncomingForm();

    form.parse(req, (err, fields): void => {
      if (err) return reject(err);
      resolve(fields as EmailFields);
    });
  });
};

export const verifyRequest = (url: string, logger: Logger): void => {
  const log = logger.prefix("verifyRequest");

  const key = url.split("key=")[1];

  if (key !== environment.SENDGRID_WEBHOOK_SECRET) {
    log.error("invalid secret");
    throw new AuthenticationError("Unauthorized");
  }

  log.debug("valid request");
};

export const handleSendGridRequest = async (
  req: NextApiRequest,
  res: NextApiResponse,
  { db, logger }: ModelOptions
): Promise<void> => {
  const log = logger.prefix("handleSendGridRequest");

  try {
    verifyRequest(req.url, logger);
    const { from, html, subject, text, to } = await buildEmailFields(req);

    await db.transaction(async (trx) => {
      const team = await findTeamForEmail(to, { db: trx, logger });
      if (!team) return;

      await createEmail(
        { from, html, subject, team_id: team.id, text, to },
        { db: trx, logger }
      );
    });

    res.status(200).end();
  } catch (error) {
    log.alert("sendgrid error", error.message);
    res.status(error.code || 500).send(error.message);
  }
};
