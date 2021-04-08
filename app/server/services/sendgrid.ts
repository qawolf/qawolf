import sgMail, { MailDataRequired } from "@sendgrid/mail";

import environment from "../environment";

sgMail.setApiKey(environment.SENDGRID_API_KEY);

type SendEmail = {
  from: MailDataRequired["from"];
  html?: string;
  reply_to?: string;
  subject?: string;
  text?: string;
  to: string;
};

export const sendEmail = async ({
  from,
  html,
  reply_to,
  subject,
  text,
  to,
}: SendEmail): Promise<void> => {
  const message = {
    from,
    html: html ? html : undefined,
    reply_to: reply_to ? { email: reply_to } : undefined,
    subject: subject ? subject : undefined,
    text: text ? text : undefined,
    to: [{ email: to }],
  };

  await sgMail.send(message);
};
