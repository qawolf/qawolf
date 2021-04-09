import { IncomingForm } from "formidable";
import { NextApiRequest, NextApiResponse } from "next";

import environment from "../environment";
import { AuthenticationError } from "../errors";
import { Logger } from "../Logger";
import { createEmail } from "../models/email";
import { findTeamForEmail } from "../models/team";
import { sendEmail } from "../services/sendgrid";
import { ModelOptions, Team } from "../types";

type EmailFields = {
  from: string;
  html: string;
  subject: string;
  text: string;
  to: string;
};

type EmailRequestFields = EmailFields & { headers: string };

type ForwardEmail = {
  email: EmailFields;
  logger: Logger;
  team: Team;
};

export const buildEmailFields = async (
  req: NextApiRequest
): Promise<EmailRequestFields> => {
  return new Promise((resolve, reject): void => {
    const form = new IncomingForm();

    form.parse(req, (err, fields): void => {
      if (err) return reject(err);
      const { from, headers, html, subject, text, to } = fields;

      resolve({ from, headers, html, subject, text, to } as EmailRequestFields);
    });
  });
};

export const buildSendDate = (headers: string): string => {
  const timestamp = headers.split("Date:")[1]?.split("\n")[0];

  let date = new Date(timestamp);
  if (isNaN(date.getTime())) date = new Date();

  return date.toISOString();
};

export const forwardEmail = async ({
  email,
  logger,
  team,
}: ForwardEmail): Promise<void> => {
  const log = logger.prefix("forwardEmail");

  if (!team.forward_emails) {
    log.debug("skip, do not forward emails");
    return;
  }
  log.debug("forward email to", team.forward_emails);

  await sendEmail({ ...email, from: email.to, to: team.forward_emails });

  log.debug("complete");
};

export const verifyRequest = (url: string, logger: Logger): void => {
  const log = logger.prefix("verifyRequest");

  const key = url.split("key=")[1];

  if (key !== environment.SENDGRID_WEBHOOK_SECRET) {
    log.error("invalid secret");
    throw new AuthenticationError();
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
    const { headers, ...fields } = await buildEmailFields(req);

    const team = await findTeamForEmail(fields.to, { db, logger });

    if (team) {
      await createEmail(
        {
          ...fields,
          created_at: buildSendDate(headers),
          team_id: team.id,
        },
        { db, logger }
      );

      await forwardEmail({ email: fields, logger, team });
    } else {
      log.debug("skip create email, no team for", fields.to);
    }

    log.debug("sendgrid success");
    res.status(200).end();
  } catch (error) {
    log.alert("sendgrid error", error.message);
    res.status(error.code || 500).send(error.message);
  }
};
