import sgMail, { MailDataRequired } from "@sendgrid/mail";

import environment from "../../environment";
import { Logger } from "../../Logger";
import { deleteInvite, findInvite } from "../../models/invite";
import { findUsersForTeam } from "../../models/user";
import { ModelOptions, Suite, SuiteRun, Trigger, User } from "../../types";
import {
  buildInviteHtml,
  buildLoginCode,
  buildLoginCodeHtml,
  buildSuiteHtml,
} from "./html";

sgMail.setApiKey(environment.SENDGRID_API_KEY);

type SendEmailForLoginCode = {
  logger: Logger;
  login_code: string;
  user: User;
};

type SendEmailForSuite = {
  logger: Logger;
  runs: SuiteRun[];
  suite_id: string;
  trigger: Trigger | null;
  user: User;
};

type SendEmailAlert = {
  runs: SuiteRun[];
  suite: Suite;
  trigger: Trigger | null;
};

const buildFrom = (wolfName: string): MailDataRequired["from"] => {
  return {
    email: `${wolfName.toLowerCase()}@qawolf.com`,
    name: `${wolfName} the QA Wolf`,
  };
};

export const sendEmailForInvite = async (
  inviteId: string,
  options: ModelOptions
): Promise<void> => {
  const log = options.logger.prefix("sendEmailForInvite");
  log.debug("invite", inviteId);

  const invite = await findInvite(inviteId, options);

  try {
    const message = {
      to: [{ email: invite.email }],
      from: buildFrom(invite.wolf_name),
      subject: `🐺 ${invite.creator_email} has invited you to join the team ${invite.team_name}`,
      html: buildInviteHtml(invite),
      reply_to: { email: "hello@qawolf.com" },
    };

    await sgMail.send(message);
    log.debug("email sent");
  } catch (error) {
    log.alert("error: email invite", invite);
    // delete invite from database if cannot send email
    await deleteInvite(invite.id, options);
  }
};

export const sendEmailForLoginCode = async ({
  logger,
  login_code,
  user,
}: SendEmailForLoginCode): Promise<void> => {
  const log = logger.prefix("sendEmailForLoginCode");
  log.debug(user.email);

  if (!user.login_code_digest || !user.login_code_expires_at) {
    logger.error(`No login code for user ${user.id}`);
    throw new Error("No login code for user");
  }

  try {
    const message = {
      to: [{ email: user.email }],
      from: buildFrom(user.wolf_name),
      subject: `🐺 QA Wolf code: ${buildLoginCode(login_code)}`,
      html: buildLoginCodeHtml({ login_code, user }),
      reply_to: { email: "hello@qawolf.com" },
    };

    await sgMail.send(message);
    log.debug(`sent email to ${user.email}`);
  } catch (error) {
    logger.alert("error: email code", user.email, error.message);
  }
};

export const sendEmailForSuite = async ({
  logger,
  runs,
  suite_id,
  trigger,
  user,
}: SendEmailForSuite): Promise<void> => {
  const log = logger.prefix("sendEmailForSuite");
  log.debug(user.email);

  const is_fail = runs.some((r) => r.status === "fail");
  const triggerName = trigger?.name || "manually triggered";

  const subject = is_fail
    ? `🐺 Oh no! Your ${triggerName} tests failed.`
    : `🎉 All good! Your ${triggerName} tests passed.`;

  try {
    const message = {
      to: [{ email: user.email }],
      from: buildFrom(user.wolf_name),
      subject,
      html: buildSuiteHtml({ runs, suite_id, trigger }),
      reply_to: { email: "hello@qawolf.com" },
    };

    log.debug("send email to %s", user.email);
    await sgMail.send(message);
  } catch (error) {
    log.alert("error: email alert", user.email, error.message);
  }
};

export const sendEmailAlert = async (
  { runs, suite, trigger }: SendEmailAlert,
  options: ModelOptions
): Promise<void> => {
  const log = options.logger.prefix("sendEmailAlert");
  log.debug("suite", suite.id);

  const users = await findUsersForTeam(suite.team_id, options);

  const sendPromises = users.map((user) =>
    sendEmailForSuite({
      logger: options.logger,
      runs,
      suite_id: suite.id,
      trigger,
      user,
    })
  );

  await Promise.all(sendPromises);
};
